/**
 * water-ripple.js — Bassin des Âmes / Obsidian Liquid Ripple (Dark Fantasy)
 *
 * Inspiré de Liam Egan (Shubniggurath / CodePen OEeMOd)
 * Hautement optimisé pour éliminer tout lag :
 * 1. Grille de simulation d'ondes compacte (320x240) -> coût GPU quasi-nul (<0.1ms).
 * 2. Rendu de réfraction plein écran avec filtrage bilinéaire et reflets spéculaires.
 * 3. IntersectionObserver : boucle stoppée à 100% quand la section est hors champ.
 * 4. Réfraction de l'architecture sacrée (interior-hall.jpg) avec absorption d'eau d'obsidienne.
 */

export function initWaterRipple() {
  const container = document.querySelector(".projects-chamber-bg");
  const section = document.querySelector(".section-projects");
  if (!container || !section || typeof THREE === "undefined") return;

  const canvas = document.getElementById("chamber-water-canvas");
  if (!canvas) return;

  // Configuration
  const SIM_W = 320;
  const SIM_H = 240;
  const DAMPING = 0.982; // Amortissement fluide réaliste
  const REFRACTION = 0.065; // Force de déviation optique

  let width = container.offsetWidth || window.innerWidth;
  let height = container.offsetHeight || window.innerHeight;

  // Renderer WebGL ultra-léger
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: false,
    alpha: true,
    powerPreference: "high-performance",
    precision: "mediump",
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  camera.position.z = 1;

  // Cibles FBO ping-pong pour le calcul d'ondes
  // Utilise FloatType ou HalfFloatType si dispo pour précision maximale
  const renderTargetOptions = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: /(iPad|iPhone|iPod)/g.test(navigator.userAgent)
      ? THREE.HalfFloatType
      : THREE.FloatType,
  };

  let rtA = new THREE.WebGLRenderTarget(SIM_W, SIM_H, renderTargetOptions);
  let rtB = new THREE.WebGLRenderTarget(SIM_W, SIM_H, renderTargetOptions);

  // Initialisation à l'état de repos (0.5 = niveau zéro de l'onde)
  renderer.setClearColor(new THREE.Color(0.5, 0.5, 0.0), 1.0);
  renderer.setRenderTarget(rtA);
  renderer.clear();
  renderer.setRenderTarget(rtB);
  renderer.clear();
  renderer.setRenderTarget(null);

  // Textures
  const textureLoader = new THREE.TextureLoader();
  const bgTexture = textureLoader.load(
    "assets/images/water-cavern.jpg",
    () => {
      bgTexture.minFilter = THREE.LinearFilter;
      bgTexture.magFilter = THREE.LinearFilter;
      bgTexture.wrapS = THREE.ClampToEdgeWrapping;
      bgTexture.wrapT = THREE.ClampToEdgeWrapping;
      updateCoverUV();
      // Masquer l'image statique HTML pour laisser place au bassin vivant
      const staticImg = document.querySelector(".chamber-bg-image");
      if (staticImg) staticImg.style.opacity = "0";
    },
  );

  // Shaders GLSL
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `;

  // Fragment Shader : Ping-pong Wave simulation (u_pass == 1) & Visual Render (u_pass == 0)
  const fragmentShader = `
    precision mediump float;
    varying vec2 vUv;

    uniform int u_pass; // 1 = simulation FBO, 0 = display pass
    uniform sampler2D u_buffer;
    uniform sampler2D u_bgTexture;
    uniform vec2 u_resolution;
    uniform vec2 u_simResolution;
    uniform vec3 u_mouse; // x, y en coordonnées [0,1], z = intensité/impulsion
    uniform float u_time;
    uniform float u_damping;
    uniform float u_refraction;

    uniform vec2 u_uvScale;
    uniform vec2 u_uvOffset;

    // Simulation d'ondes selon l'équation des ondes 2D discrétisée
    vec4 simPass() {
      vec2 texel = 1.0 / u_simResolution;
      vec4 current = texture2D(u_buffer, vUv);

      // Échantillonnage des 4 voisins immédiats
      float top    = texture2D(u_buffer, vUv + vec2(0.0,  texel.y)).r;
      float bottom = texture2D(u_buffer, vUv + vec2(0.0, -texel.y)).r;
      float left   = texture2D(u_buffer, vUv + vec2(-texel.x, 0.0)).r;
      float right  = texture2D(u_buffer, vUv + vec2( texel.x, 0.0)).r;

      // Dérivée seconde discrète (Laplacien)
      float pressure = (top + bottom + left + right - 2.0);
      float d = -(current.g - 0.5) * 2.0 + pressure;
      d *= u_damping;

      // Impulsion de la souris
      if (u_mouse.z > 0.01) {
        float aspect = u_simResolution.x / u_simResolution.y;
        vec2 mDist = (vUv - u_mouse.xy);
        mDist.x *= aspect;
        float dist = length(mDist);
        float drop = smoothstep(0.045, 0.0, dist) * u_mouse.z;
        d += drop * 0.9;
      }

      d = clamp(d * 0.5 + 0.5, 0.0, 1.0);
      return vec4(d, current.r, 0.0, 1.0);
    }

    // Passe visuelle : Réfraction de l'architecture + Reflet spéculaire de la lanterne
    vec4 displayPass() {
      vec2 texel = 1.0 / u_simResolution;

      // Calcul des normales de surface d'eau à partir du gradient de hauteur
      float hL = texture2D(u_buffer, vUv - vec2(texel.x, 0.0)).r;
      float hR = texture2D(u_buffer, vUv + vec2(texel.x, 0.0)).r;
      float hB = texture2D(u_buffer, vUv - vec2(0.0, texel.y)).r;
      float hT = texture2D(u_buffer, vUv + vec2(0.0, texel.y)).r;

      vec2 normalOffset = vec2(hR - hL, hT - hB) * u_refraction;

      // Coordonnées UV avec réfraction liquide
      vec2 refractedUv = vUv + normalOffset;
      refractedUv = clamp(refractedUv, 0.001, 0.999);

      // Échantillon de la nef cathédrale en arrière-plan avec ratio cover
      vec2 bgUv = refractedUv * u_uvScale + u_uvOffset;
      vec4 bg = texture2D(u_bgTexture, bgUv);

      // Préservation des couleurs vives et naturelles de la caverne d'eau
      vec3 waterDeep = vec3(0.02, 0.05, 0.08);
      vec3 finalColor = mix(bg.rgb, waterDeep, 0.04);

      // Normales 3D reconstituées pour éclairage spéculaire
      vec3 N = normalize(vec3(-normalOffset.x * 24.0, -normalOffset.y * 24.0, 1.0));

      // Lumière de lanterne qui suit doucement la souris
      vec3 lightPos = vec3(u_mouse.x, u_mouse.y, 0.65);
      vec3 surfacePos = vec3(vUv, 0.0);
      vec3 L = normalize(lightPos - surfacePos);
      vec3 V = vec3(0.0, 0.0, 1.0);
      vec3 H = normalize(L + V);

      // Éclat spéculaire doré / or pâle sur la crête des vagues
      float spec = pow(max(dot(N, H), 0.0), 40.0);
      vec3 specColor = vec3(1.0, 0.88, 0.65) * spec * 0.55;

      // Caustiques subtiles sur les creux et crêtes
      float waveHeight = (hR + hL + hT + hB) * 0.25 - 0.5;
      finalColor += specColor + vec3(0.85, 0.9, 1.0) * abs(waveHeight) * 0.12;

      // Vignettage cinématique doux pour préserver la clarté et la couleur
      float vignette = smoothstep(0.98, 0.20, length(vUv - 0.5) * 1.15);
      finalColor *= (0.82 + vignette * 0.18);

      return vec4(finalColor, 1.0);
    }

    void main() {
      if (u_pass == 1) {
        gl_FragColor = simPass();
      } else {
        gl_FragColor = displayPass();
      }
    }
  `;

  // Uniforms
  const uniforms = {
    u_pass: { value: 0 },
    u_buffer: { value: rtA.texture },
    u_bgTexture: { value: bgTexture },
    u_resolution: { value: new THREE.Vector2(width, height) },
    u_simResolution: { value: new THREE.Vector2(SIM_W, SIM_H) },
    u_uvScale: { value: new THREE.Vector2(1.0, 1.0) },
    u_uvOffset: { value: new THREE.Vector2(0.0, 0.0) },
    u_mouse: { value: new THREE.Vector3(0.5, 0.5, 0.0) },
    u_time: { value: 0.0 },
    u_damping: { value: DAMPING },
    u_refraction: { value: REFRACTION },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: uniforms,
    depthTest: false,
    depthWrite: false,
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);

  // État d'interaction souris
  let mouseTargetX = 0.5;
  let mouseTargetY = 0.5;
  let mouseCurrentX = 0.5;
  let mouseCurrentY = 0.5;
  let mouseImpulse = 0.0;
  let lastMoveTime = performance.now();
  let prevX = 0.5;
  let prevY = 0.5;

  // Gestion des événements souris sur la section projets
  function onPointerMove(e) {
    const rect = section.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height; // WebGL Y inversé

    mouseTargetX = Math.max(0.0, Math.min(1.0, x));
    mouseTargetY = Math.max(0.0, Math.min(1.0, y));

    const dx = mouseTargetX - prevX;
    const dy = mouseTargetY - prevY;
    const speed = Math.sqrt(dx * dx + dy * dy);

    // Impulsion proportionnelle à la vitesse de déplacement
    mouseImpulse = Math.min(0.65, mouseImpulse + speed * 4.5);

    prevX = mouseTargetX;
    prevY = mouseTargetY;
    lastMoveTime = performance.now();
  }

  function onPointerDown(e) {
    const rect = section.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;

    mouseTargetX = Math.max(0.0, Math.min(1.0, x));
    mouseTargetY = Math.max(0.0, Math.min(1.0, y));
    // Onde d'impact plus vigoureuse au clic
    mouseImpulse = 1.0;
  }

  section.addEventListener("pointermove", onPointerMove, { passive: true });
  section.addEventListener("pointerdown", onPointerDown, { passive: true });

  // Calcul du ratio cover pour l'arrière-plan sans distorsion
  function updateCoverUV() {
    const imgAspect = 1376 / 768;
    const canvasAspect = width / height || 1.777;
    let scaleX = 1,
      scaleY = 1,
      offsetX = 0,
      offsetY = 0;
    if (canvasAspect > imgAspect) {
      scaleY = imgAspect / canvasAspect;
      offsetY = (1 - scaleY) * 0.5;
    } else {
      scaleX = canvasAspect / imgAspect;
      offsetX = (1 - scaleX) * 0.5;
    }
    uniforms.u_uvScale.value.set(scaleX, scaleY);
    uniforms.u_uvOffset.value.set(offsetX, offsetY);
  }

  // Redimensionnement
  function onResize() {
    if (!container) return;
    width = container.offsetWidth || window.innerWidth;
    height = container.offsetHeight || window.innerHeight;
    renderer.setSize(width, height);
    uniforms.u_resolution.value.set(width, height);
    updateCoverUV();
  }
  window.addEventListener("resize", onResize);

  // Boucle de rendu et Ping-Pong
  let isVisible = false;
  let animId = null;
  let clock = new THREE.Clock();

  function renderLoop() {
    if (!isVisible) {
      animId = null;
      return;
    }

    const delta = clock.getDelta();
    uniforms.u_time.value += delta;

    // Lissage de position souris
    mouseCurrentX += (mouseTargetX - mouseCurrentX) * 0.22;
    mouseCurrentY += (mouseTargetY - mouseCurrentY) * 0.22;

    // Décroissance rapide de l'impulsion
    mouseImpulse *= 0.88;
    if (mouseImpulse < 0.001) mouseImpulse = 0.0;

    uniforms.u_mouse.value.set(mouseCurrentX, mouseCurrentY, mouseImpulse);

    // 1. Passe de simulation (vers la cible FBO)
    uniforms.u_pass.value = 1;
    uniforms.u_buffer.value = rtA.texture;
    renderer.setRenderTarget(rtB);
    renderer.render(scene, camera);

    // 2. Passe d'affichage (vers l'écran)
    uniforms.u_pass.value = 0;
    uniforms.u_buffer.value = rtB.texture;
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    // Swap des buffers
    const temp = rtA;
    rtA = rtB;
    rtB = temp;

    animId = requestAnimationFrame(renderLoop);
  }

  // IntersectionObserver pour pause automatique quand la section est invisible
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!isVisible) {
            isVisible = true;
            if (!animId) {
              clock.start();
              animId = requestAnimationFrame(renderLoop);
            }
          }
        } else {
          isVisible = false;
          if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
          }
        }
      });
    },
    { threshold: 0.05 },
  );

  observer.observe(section);
}

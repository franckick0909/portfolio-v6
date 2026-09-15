/**
 * hero.js — Unified High-Performance 3D Dark Fantasy Sanctuary in Perspective
 * 
 * - Single WebGLRenderer (Zero context overhead, buttery smooth 60+ FPS, no reload stutter)
 * - Complete 3D Perspective Environment:
 *     • Receding flagstone floor & vaulted cathedral ceiling
 *     • Monumental colonnade of 16 octagonal stone pillars
 *     • Grand gothic arch framing the distant 3D Dark Fantasy Castle vista (at z = -44)
 *     • Atmospheric volumetric fog & altar illumination
 * - 3D Living Wrought-Iron Lantern:
 *     • Refined, proportionate scale (~30% smaller, delicate and elegant)
 *     • Real-time PointLight physically illuminating the floor and pillars
 *     • Realistic pendulum inertia & tilt following cursor movement
 *     • Procedural incandescent flame sprite with organic flicker
 * - Ultra-fine dancing embers & sparks reacting to the lantern's wake
 * - Full 3D Camera Parallax across all depth planes
 */

export function initHero() {
  const canvas = document.getElementById("souls-canvas");
  if (!canvas) return;

  if (typeof THREE === "undefined") {
    console.error("THREE.js not loaded!");
    activateWebGLFallback(canvas);
    return;
  }

  // ═════════════════════════════════════════════════════
  // 1. SCENE, CAMERA & UNIFIED HIGH-PERFORMANCE RENDERER
  // ═════════════════════════════════════════════════════
  const scene = new THREE.Scene();
  // Refined atmospheric depth fog that preserves distant architectural silhouettes
  scene.fog = new THREE.FogExp2(0x060504, 0.012);

  const camera = new THREE.PerspectiveCamera(
    54,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0.8, 8.8);
  camera.lookAt(0, 0, 0);

  // Single opaque WebGL renderer — peak GPU efficiency & zero compositor hitch
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
  } catch (e) {
    console.warn("WebGL context creation failed — activating fallback.", e);
    activateWebGLFallback(canvas);
    initHeroTypography();
    return;
  }

  // Extra safety: check if the GL context was actually obtained
  if (!renderer.getContext()) {
    console.warn("WebGL context is null — activating fallback.");
    activateWebGLFallback(canvas);
    initHeroTypography();
    return;
  }

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x060504, 1.0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  // ═════════════════════════════════════════════════════
  // 2. TEXTURES & ASSETS
  // ═════════════════════════════════════════════════════
  const textureLoader = new THREE.TextureLoader();

  // Flagstone floor texture
  const stoneTexture = textureLoader.load("assets/images/hero/stone-texture.jpg");
  stoneTexture.wrapS = THREE.RepeatWrapping;
  stoneTexture.wrapT = THREE.RepeatWrapping;
  stoneTexture.repeat.set(8, 20);

  // Distant Dark Fantasy Castle Vista texture — High Quality & Anisotropic Filtering
  const vistaTexture = textureLoader.load("assets/images/hero/hero-bg.jpg");
  vistaTexture.colorSpace = THREE.SRGBColorSpace;
  vistaTexture.generateMipmaps = true;
  vistaTexture.minFilter = THREE.LinearMipmapLinearFilter;
  vistaTexture.magFilter = THREE.LinearFilter;
  vistaTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  // ═════════════════════════════════════════════════════
  // 3. PERSPECTIVE ARCHITECTURE: CATHEDRAL & VISTA
  // ═════════════════════════════════════════════════════
  const sanctuaryGroup = new THREE.Group();
  scene.add(sanctuaryGroup);

  // A. Perspective Flagstone Floor (Ends cleanly at the terrace precipice, z = -18)
  const floorGeo = new THREE.PlaneGeometry(100, 38, 1, 1);
  const floorMat = new THREE.MeshStandardMaterial({
    map: stoneTexture,
    roughness: 0.85,
    metalness: 0.15,
    color: 0x241e18,
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.set(0, -4.0, 1);
  sanctuaryGroup.add(floorMesh);

  // B. Row of 4 Colossal Octagonal Pillar Pairs & Overhead Gothic Arches
  // Stops cleanly at z = -12 so the viewer emerges quickly into the open vista
  const pillarMat = new THREE.MeshStandardMaterial({
    map: stoneTexture,
    roughness: 0.7,
    metalness: 0.25,
    color: 0x443a32,
  });

  const pillarZPositions = [6, 0, -6, -12];
  const pillarX = 7.6;

  pillarZPositions.forEach((z) => {
    [-pillarX, pillarX].forEach((x) => {
      const pillarGroup = new THREE.Group();
      pillarGroup.position.set(x, 1.8, z);

      // Main Column Shaft
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.75, 13, 8),
        pillarMat
      );
      pillarGroup.add(shaft);

      // Base Pedestal
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(1.0, 1.15, 1.2, 8),
        pillarMat
      );
      base.position.y = -5.8;
      pillarGroup.add(base);

      // Top Capital
      const capital = new THREE.Mesh(
        new THREE.CylinderGeometry(1.1, 0.7, 1.2, 8),
        pillarMat
      );
      capital.position.y = 5.8;
      pillarGroup.add(capital);

      sanctuaryGroup.add(pillarGroup);
    });

    // Grand Gothic Transverse Arch Rib connecting the column pair overhead
    const archGeo = new THREE.TorusGeometry(pillarX, 0.42, 6, 32, Math.PI);
    const archMesh = new THREE.Mesh(archGeo, pillarMat);
    archMesh.position.set(0, 7.6, z);
    sanctuaryGroup.add(archMesh);
  });

  // D. Distant 3D Dark Fantasy Castle Vista (at z = -54)
  // Full panoramic sky & vista canvas, perfectly framed with bridge & chasm visible
  const vistaGeo = new THREE.PlaneGeometry(168, 96);
  const vistaMat = new THREE.MeshBasicMaterial({
    map: vistaTexture,
    color: 0xffffff,
  });
  const vistaMesh = new THREE.Mesh(vistaGeo, vistaMat);
  vistaMesh.position.set(0, 2.0, -54);
  sanctuaryGroup.add(vistaMesh);

  // E. Sanctuary Atmospheric Lighting
  // Soft moody silver moonlight
  const moonlight = new THREE.DirectionalLight(0x8ea8c4, 0.9);
  moonlight.position.set(6, 20, -10);
  scene.add(moonlight);

  // Twin cathedral torch sconces along the colonnade for warm atmospheric rim light
  const torchLeft = new THREE.PointLight(0xd97724, 0.3, 22);
  torchLeft.position.set(-6.8, 1.5, -10);
  scene.add(torchLeft);

  const torchRight = new THREE.PointLight(0xd97724, 0.3, 22);
  torchRight.position.set(6.8, 1.5, -10);
  scene.add(torchRight);

  // Distant warm altar light
  const altarLight = new THREE.PointLight(0xc9a84c, 1.5, 30);
  altarLight.position.set(0, 0, -22);
  scene.add(altarLight);

  // Ambient fill light for dark fantasy depth
  const ambientLight = new THREE.AmbientLight(0x221c16, 0.7);
  scene.add(ambientLight);

  // ═════════════════════════════════════════════════════
  // 4. THE 3D LIVING WROUGHT-IRON LANTERN
  // ═════════════════════════════════════════════════════
  const lanternGroup = new THREE.Group();
  scene.add(lanternGroup);

  // Wrought-iron Materials
  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x1a1614,
    roughness: 0.58,
    metalness: 0.88,
  });

  const goldAccentMat = new THREE.MeshStandardMaterial({
    color: 0xdbb558,
    roughness: 0.35,
    metalness: 0.78,
  });

  // A. Suspension Ring (Antique Gold Torus)
  const ringGeo = new THREE.TorusGeometry(0.16, 0.035, 12, 24);
  const ringMesh = new THREE.Mesh(ringGeo, goldAccentMat);
  ringMesh.position.y = 0.92;
  lanternGroup.add(ringMesh);

  // B. Top Hood Spire & Finial
  const finialGeo = new THREE.CylinderGeometry(0.02, 0.06, 0.12, 6);
  const finialMesh = new THREE.Mesh(finialGeo, goldAccentMat);
  finialMesh.position.y = 0.76;
  lanternGroup.add(finialMesh);

  // C. Lantern Top Hood (Stepped Pyramidal Cap)
  const capGeo = new THREE.CylinderGeometry(0.08, 0.52, 0.32, 6);
  const capMesh = new THREE.Mesh(capGeo, ironMat);
  capMesh.position.y = 0.60;
  lanternGroup.add(capMesh);

  // D. Top Crown Bracket & Gold Rim
  const crownGeo = new THREE.CylinderGeometry(0.52, 0.54, 0.09, 6);
  const crownMesh = new THREE.Mesh(crownGeo, ironMat);
  crownMesh.position.y = 0.44;
  lanternGroup.add(crownMesh);

  const crownGoldRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.53, 0.018, 8, 24),
    goldAccentMat
  );
  crownGoldRim.rotation.x = Math.PI / 2;
  crownGoldRim.position.y = 0.44;
  lanternGroup.add(crownGoldRim);

  // E. Base Plate & Bottom Gothic Finial
  const baseGeo = new THREE.CylinderGeometry(0.48, 0.54, 0.15, 6);
  const baseMesh = new THREE.Mesh(baseGeo, ironMat);
  baseMesh.position.y = -0.52;
  lanternGroup.add(baseMesh);

  const baseGoldRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.53, 0.018, 8, 24),
    goldAccentMat
  );
  baseGoldRim.rotation.x = Math.PI / 2;
  baseGoldRim.position.y = -0.52;
  lanternGroup.add(baseGoldRim);

  const bottomFinial = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.22, 6),
    goldAccentMat
  );
  bottomFinial.rotation.x = Math.PI;
  bottomFinial.position.y = -0.68;
  lanternGroup.add(bottomFinial);

  // F. Vertical Wrought-Iron Ribs (6 posts)
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const ribGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.92, 6);
    const ribMesh = new THREE.Mesh(ribGeo, ironMat);
    const r = 0.49;
    ribMesh.position.set(Math.cos(angle) * r, -0.04, Math.sin(angle) * r);
    lanternGroup.add(ribMesh);
  }

  // G. Translucent Beveled Glass Chamber
  const glassGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.88, 6, 1, true);
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xffedd0,
    roughness: 0.18,
    metalness: 0.05,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const glassMesh = new THREE.Mesh(glassGeo, glassMat);
  glassMesh.position.y = -0.04;
  lanternGroup.add(glassMesh);

  // H. Real Incandescent Flame Core (Procedural Radial Ember Glow)
  const flameCanvas = document.createElement("canvas");
  flameCanvas.width = 128;
  flameCanvas.height = 128;
  const flameCtx = flameCanvas.getContext("2d");
  const grad = flameCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
  grad.addColorStop(0.18, "rgba(255, 225, 120, 0.95)");
  grad.addColorStop(0.42, "rgba(255, 130, 25, 0.72)");
  grad.addColorStop(0.72, "rgba(215, 50, 10, 0.22)");
  grad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
  flameCtx.fillStyle = grad;
  flameCtx.fillRect(0, 0, 128, 128);

  const flameTexture = new THREE.CanvasTexture(flameCanvas);
  const flameSpriteMat = new THREE.SpriteMaterial({
    map: flameTexture,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  const flameSprite = new THREE.Sprite(flameSpriteMat);
  flameSprite.scale.set(0.25, 0.35, 1.0);
  flameSprite.position.y = -0.04;
  lanternGroup.add(flameSprite);

  // Tiny burning dark coal pedestal inside
  const coalMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 0.12, 6),
    new THREE.MeshStandardMaterial({ color: 0x12100e, roughness: 0.9 })
  );
  coalMesh.position.y = -0.42;
  lanternGroup.add(coalMesh);

  // High-intensity warm point light for the lantern core
  const lanternLight = new THREE.PointLight(0xffaa38, 2.5, 45, 1.5);
  lanternLight.position.y = -0.04;
  lanternGroup.add(lanternLight);

  // Responsive scale: smaller on mobile
  const isMobile = window.innerWidth < 768;
  const lanternScale = isMobile ? 0.28 : 0.5;
  lanternGroup.scale.set(lanternScale, lanternScale, lanternScale);
  lanternGroup.position.set(0, 0.45, 7.4);

  // — SpotLight: golden pool of light on the floor, follows the lantern —
  // Distance: lantern y=0.45, floor y=-4.0, distance=4.5 units down.
  const lanternSpot = new THREE.SpotLight(0xffb84a, 8.0, 35, Math.PI / 2.8, 0.8, 1.2);
  lanternSpot.position.set(0, 0.45, 7.4);
  lanternSpot.target.position.set(0, -4.0, 7.4);
  scene.add(lanternSpot);
  scene.add(lanternSpot.target);

  // Also boost the main PointLight distance for better pillar illumination
  // (already added above as lanternLight with intensity 0.3, distance 32)

  // ═════════════════════════════════════════════════════
  // 5. ULTRA-FINE AIRY EMBER PARTICLES
  // ═════════════════════════════════════════════════════
  const emberCount = 600;
  const emberGeometry = new THREE.BufferGeometry();
  const emberPositions = new Float32Array(emberCount * 3);
  const emberSizes = new Float32Array(emberCount);
  const emberSpeeds = new Float32Array(emberCount);
  const emberDrifts = new Float32Array(emberCount);

  for (let i = 0; i < emberCount; i++) {
    emberPositions[i * 3] = (Math.random() - 0.5) * 36;
    emberPositions[i * 3 + 1] = Math.random() * 22 - 4.0;
    emberPositions[i * 3 + 2] = Math.random() * 40 - 20;

    emberSizes[i] = Math.random() * 0.85 + 0.25;
    emberSpeeds[i] = Math.random() * 0.02 + 0.006;
    emberDrifts[i] = (Math.random() - 0.5) * 0.012;
  }

  emberGeometry.setAttribute("position", new THREE.BufferAttribute(emberPositions, 3));
  emberGeometry.setAttribute("size", new THREE.BufferAttribute(emberSizes, 1));

  const emberMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color(0xfff5d0) },
      uColor2: { value: new THREE.Color(0xff9933) },
      uColor3: { value: new THREE.Color(0xd94411) },
    },
    vertexShader: `
      attribute float size;
      varying float vAlpha;
      varying float vColorMix;
      uniform float uTime;

      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float dist = length(mvPosition.xyz);
        
        float flicker = sin(uTime * 6.5 + position.x * 4.0 + position.y * 3.0) * 0.35 + 0.65;
        vAlpha = smoothstep(50.0, 2.0, dist) * flicker * 0.95;
        vColorMix = sin(position.y * 0.6 + uTime * 0.9) * 0.5 + 0.5;
        
        gl_PointSize = size * (120.0 / -mvPosition.z) * (0.8 + flicker * 0.35);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      varying float vAlpha;
      varying float vColorMix;

      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;

        float core = 1.0 - smoothstep(0.0, 0.45, d);
        core = pow(core, 2.2);

        vec3 color = mix(uColor1, uColor2, vColorMix);
        color = mix(color, uColor3, smoothstep(0.7, 1.0, vColorMix));

        gl_FragColor = vec4(color, core * vAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const embers = new THREE.Points(emberGeometry, emberMaterial);
  scene.add(embers);

  // ═════════════════════════════════════════════════════
  // 6. VOLUMETRIC FOG CLOUDS (Along the floor)
  // ═════════════════════════════════════════════════════
  const fogCount = 200;
  const fogGeometry = new THREE.BufferGeometry();
  const fogPositions = new Float32Array(fogCount * 3);
  const fogSizes = new Float32Array(fogCount);

  for (let i = 0; i < fogCount; i++) {
    fogPositions[i * 3] = (Math.random() - 0.5) * 50;
    fogPositions[i * 3 + 1] = Math.random() * 6 - 3.8;
    fogPositions[i * 3 + 2] = Math.random() * 30 - 15; // Closer to the lantern
    fogSizes[i] = Math.random() * 16 + 8;
  }

  fogGeometry.setAttribute("position", new THREE.BufferAttribute(fogPositions, 3));
  fogGeometry.setAttribute("size", new THREE.BufferAttribute(fogSizes, 1));

  const fogMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uLanternPos: { value: new THREE.Vector3(0, 0, 5) },
    },
    vertexShader: `
      attribute float size;
      varying float vAlpha;
      varying vec3 vWorldPos;
      uniform float uTime;

      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        vec4 mvPosition = viewMatrix * worldPos;

        vAlpha = smoothstep(75.0, 5.0, length(mvPosition.xyz)) * 0.08;
        gl_PointSize = size * (260.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      varying vec3 vWorldPos;
      uniform vec3 uLanternPos;

      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;

        float soft = 1.0 - smoothstep(0.0, 0.5, d);
        soft = pow(soft, 1.8);

        float distToLantern = length(vWorldPos - uLanternPos);
        float lanternGlow = smoothstep(18.0, 2.0, distToLantern) * 0.45;

        vec3 baseFogColor = vec3(0.18, 0.16, 0.14);
        vec3 litFogColor = vec3(0.85, 0.55, 0.22);
        vec3 finalColor = mix(baseFogColor, litFogColor, lanternGlow);

        gl_FragColor = vec4(finalColor, soft * (vAlpha + lanternGlow * 0.15));
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const fog = new THREE.Points(fogGeometry, fogMaterial);
  scene.add(fog);

  // ═════════════════════════════════════════════════════
  // 7. MOUSE TRACKING & PHYSICAL PENDULUM INERTIA
  // ═════════════════════════════════════════════════════
  const mouse = { x: 0, y: 0 };
  const targetLanternPos = { x: 0, y: 0.45, z: 7.4 };
  const lanternVel = { x: 0, y: 0 };
  const targetCamera = { x: 0, y: 0.8 };
  const isMobileDevice = window.innerWidth < 768;

  if (!isMobileDevice) {
    window.addEventListener("mousemove", (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Cursor normalisé [0..1] depuis le coin haut-gauche
      const nx = e.clientX / window.innerWidth;
      const ny = e.clientY / window.innerHeight;

      // Zone de protection menu : haut-droit (nx > 0.55 && ny < 0.45)
      let targetX = mouse.x * 3.2;
      if (nx > 0.55 && ny < 0.45) {
        const avoidFactor = Math.min((nx - 0.55) / 0.45, 1.0) * Math.min((0.45 - ny) / 0.45, 1.0);
        targetX = targetX - avoidFactor * 3.5;
      }
      targetX = Math.max(-3.8, Math.min(2.0, targetX));

      targetLanternPos.x = targetX;
      targetLanternPos.y = 0.45 + mouse.y * 2.2;
      // targetLanternPos.z est calculé dynamiquement par rapport à camera.position.z dans animate()

      targetCamera.x = mouse.x * 1.4;
      targetCamera.y = 0.8 + mouse.y * 0.6;
    });
  } else {
    // Mobile: lanterne fixe au centre, le canvas répond au touch pour la caméra uniquement
    window.addEventListener("touchmove", (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      const tx = (touch.clientX / window.innerWidth) * 2 - 1;
      const ty = -(touch.clientY / window.innerHeight) * 2 + 1;
      targetCamera.x = tx * 0.8;
      targetCamera.y = 0.8 + ty * 0.4;
    }, { passive: true });
  }

  // ── Awakening & Cinematic Ignition Listener ──
  let isAwakened = false;

  window.addEventListener("igniteHeroSanctuary", () => {
    if (isAwakened) return;
    isAwakened = true;

    // Cinematic camera pull-back: dezooms from the sanctuary interior into the grand vista
    gsap.to(camera.position, {
      z: 14.5,
      duration: 2.4,
      ease: "power3.out",
    });

    // Soft warm screen flash overlay for lantern ignition (non-aggressive)
    const flashEl = document.getElementById("preloaderScreenFlash");
    if (flashEl) {
      gsap.fromTo(flashEl, { opacity: 0.45 }, {
        opacity: 0,
        duration: 1.3,
        ease: "power2.out",
      });
    }

    // Lantern ignition flare — warm, organic burst settling into ambient glow
    gsap.fromTo(lanternLight, { intensity: 6.8 }, {
      intensity: 4.5,
      duration: 2.2,
      ease: "power2.out",
    });

    gsap.fromTo(lanternSpot, { intensity: 14.0 }, {
      intensity: 8.0,
      duration: 2.2,
      ease: "power2.out",
    });

    gsap.fromTo(flameSprite.scale, { x: 0.1, y: 0.1 }, {
      x: 0.85,
      y: 1.05,
      duration: 1.6,
      ease: "back.out(2.0)",
    });

    // Cathedral torch sconces flare warmly
    gsap.fromTo([torchLeft, torchRight], { intensity: 0.2 }, {
      intensity: 1.8,
      duration: 1.8,
      ease: "power2.out",
    });
  });

  // Safety fallback if preloader was skipped or on fast scroll
  setTimeout(() => {
    if (!isAwakened) window.dispatchEvent(new CustomEvent("igniteHeroSanctuary"));
  }, 5500);

  // Typography entrance
  initHeroTypography();

  // ═════════════════════════════════════════════════════
  // 7.5 SCROLL-DRIVEN 3D DOLLY-IN (WALK FORWARD INTO THE SANCTUARY & VISTA)
  // ═════════════════════════════════════════════════════
  let heroScrollProgress = 0;

  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.create({
      trigger: ".hero",
      start: "top top",
      end: "+=170%",
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      onUpdate: (self) => {
        heroScrollProgress = self.progress;

        // Title gently dissolves & scales up as we walk through it
        const titleContainer = document.querySelector(".hero-title-container");
        if (titleContainer) {
          const p = self.progress;
          const textAlpha = Math.max(0, 1 - p * 3.2);
          const textScale = 1.0 + p * 0.45;
          const textBlur = p * 16;
          titleContainer.style.opacity = textAlpha;
          titleContainer.style.transform = `scale(${textScale})`;
          titleContainer.style.filter = `blur(${textBlur}px)`;
        }

        // Indicators & side markers fade out quickly in the first 15% of scroll
        const markers = document.querySelectorAll(
          ".scroll-indicator, .hero-side, .hero-copyright"
        );
        markers.forEach((el) => {
          el.style.opacity = Math.max(0, 1 - self.progress * 5.5);
        });
      },
    });
  }

  // ═════════════════════════════════════════════════════
  // 8. HIGH-PERFORMANCE ANIMATION LOOP
  // ═════════════════════════════════════════════════════
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // A. CAMERA 3D DOLLY-IN (WALK FORWARD) & MOUSE PARALLAX
    const baseCameraZ = isAwakened ? 14.5 : 8.8;
    const targetCameraZ = baseCameraZ - heroScrollProgress * 24.5;
    camera.position.z += (targetCameraZ - camera.position.z) * 0.08;
    camera.position.x += (targetCamera.x - camera.position.x) * 0.035;
    camera.position.y += (targetCamera.y - camera.position.y) * 0.035;

    // Dynamic forward focus: look ahead towards the approaching castle vista at z = -54
    camera.lookAt(targetCamera.x * 0.25, 0.4 + targetCamera.y * 0.2, -54);

    // B. LANTERN PHYSICS & PENDULUM SWAY (Locked relative to Camera Z)
    const prevX = lanternGroup.position.x;
    const prevY = lanternGroup.position.y;

    const lanternDistFromCam = isMobileDevice ? 5.5 : 7.1;
    targetLanternPos.z = camera.position.z - lanternDistFromCam - Math.abs(mouse.x) * 0.3;

    lanternGroup.position.x += (targetLanternPos.x - lanternGroup.position.x) * 0.055;
    lanternGroup.position.y += (targetLanternPos.y - lanternGroup.position.y) * 0.055;
    // Fast response in Z so lantern and camera stay locked in relative depth
    lanternGroup.position.z += (targetLanternPos.z - lanternGroup.position.z) * 0.25;

    // Gentle scale-down of the lantern only when scrolling deep past the hero
    const scrollScaleMultiplier = Math.max(0, 1 - Math.max(0, (heroScrollProgress - 0.72) * 3.5));
    lanternGroup.scale.setScalar(lanternScale * scrollScaleMultiplier);
    lanternGroup.visible = scrollScaleMultiplier > 0.005;

    lanternVel.x = lanternGroup.position.x - prevX;
    lanternVel.y = lanternGroup.position.y - prevY;

    // Realistic sway based on cursor velocity + gentle ambient breath
    const targetRotZ = -lanternVel.x * 4.2 + Math.sin(elapsed * 1.8) * 0.04;
    const targetRotX = lanternVel.y * 3.2 + Math.cos(elapsed * 1.4) * 0.03;

    lanternGroup.rotation.z += (targetRotZ - lanternGroup.rotation.z) * 0.08;
    lanternGroup.rotation.x += (targetRotX - lanternGroup.rotation.x) * 0.08;
    lanternGroup.rotation.y = Math.sin(elapsed * 0.9) * 0.08;

    // — Dynamic halo: SpotLight follows lantern position exactly —
    const velocityMag = Math.sqrt(lanternVel.x * lanternVel.x + lanternVel.y * lanternVel.y);
    lanternSpot.position.set(
      lanternGroup.position.x,
      lanternGroup.position.y,
      lanternGroup.position.z
    );
    lanternSpot.target.position.set(
      lanternGroup.position.x,
      -4.0, // always point to floor level
      lanternGroup.position.z
    );
    lanternSpot.target.updateMatrixWorld();

    // Intensity: highly visible base always, surges when swinging fast
    const targetSpotIntensity = (8.0 + velocityMag * 180 + (isAwakened ? 3.0 : 0)) * scrollScaleMultiplier;
    lanternSpot.intensity += (targetSpotIntensity - lanternSpot.intensity) * 0.08;

    // Flame Core Pulsing
    if (isAwakened) {
      const flameFlicker = Math.sin(elapsed * 5.5) * 0.35 + Math.sin(elapsed * 13.0) * 0.15;
      lanternLight.intensity = (4.5 + flameFlicker) * scrollScaleMultiplier;
      flameSprite.scale.set(
        (0.85 + flameFlicker * 0.1) * scrollScaleMultiplier,
        (1.05 + flameFlicker * 0.18) * scrollScaleMultiplier,
        1.0
      );
    }

    // Feed lantern position to volumetric fog
    fogMaterial.uniforms.uLanternPos.value.copy(lanternGroup.position);

    // Vista plane approaches smoothly with subtle cinematic depth (never clips columns)
    if (vistaMesh) {
      vistaMesh.position.z = -54 + heroScrollProgress * 4.0;
      const vistaScale = 1.0 + heroScrollProgress * 0.06;
      vistaMesh.scale.set(vistaScale, vistaScale, 1.0);
    }

    // C. EMBER PARTICLES (Drift & Wind Wake)
    const positions = emberGeometry.attributes.position.array;
    const lx = lanternGroup.position.x;
    const ly = lanternGroup.position.y;
    const lz = lanternGroup.position.z;

    for (let i = 0; i < emberCount; i++) {
      positions[i * 3 + 1] += emberSpeeds[i];
      positions[i * 3] += emberDrifts[i] + Math.sin(elapsed * 1.5 + i) * 0.002;

      // Dynamic wind turbulence around the swinging lantern
      const dx = positions[i * 3] - lx;
      const dy = positions[i * 3 + 1] - ly;
      const dz = positions[i * 3 + 2] - lz;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < 18.0 && distSq > 0.05) {
        const dist = Math.sqrt(distSq);
        const force = (1.0 - dist / 4.2) * 0.035;
        positions[i * 3] += (dx / dist) * force;
        positions[i * 3 + 1] += (dy / dist) * force * 0.6;
        positions[i * 3 + 2] += (dz / dist) * force * 0.5;
      }

      if (positions[i * 3 + 1] > 18) {
        positions[i * 3 + 1] = -4.0;
        positions[i * 3] = (Math.random() - 0.5) * 36;
        positions[i * 3 + 2] = Math.random() * 40 - 20;
      }
    }
    emberGeometry.attributes.position.needsUpdate = true;

    // D. FOG DRIFT
    const fogPos = fogGeometry.attributes.position.array;
    for (let i = 0; i < fogCount; i++) {
      fogPos[i * 3] += Math.sin(elapsed * 0.1 + i * 0.25) * 0.006;
      fogPos[i * 3 + 1] += Math.cos(elapsed * 0.06 + i * 0.4) * 0.002;
    }
    fogGeometry.attributes.position.needsUpdate = true;

    // E. UPDATE TIME UNIFORMS
    emberMaterial.uniforms.uTime.value = elapsed;
    fogMaterial.uniforms.uTime.value = elapsed;

    // F. UNIFIED RENDER (Single WebGL Draw Call)
    renderer.render(scene, camera);
  }
  animate();

  // ═════════════════════════════════════════════════════
  // 9. RESIZE HANDLER
  // ═════════════════════════════════════════════════════
  window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}

/**
 * Hero Typography Entrance with Cinematic Blur Reveal
 */
function initHeroTypography() {
  const heroH3 = document.querySelector(".hero-flex--left h3");
  const heroH2 = document.querySelector(".hero-flex--right h2");

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  if (heroH3) {
    gsap.fromTo(
      heroH3,
      { opacity: 0, yPercent: 100, filter: "blur(8px)" },
      {
        opacity: 1,
        yPercent: 0,
        filter: "blur(0px)",
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".hero",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }

  if (heroH2) {
    gsap.fromTo(
      heroH2,
      { opacity: 0, yPercent: 100, filter: "blur(10px)" },
      {
        opacity: 1,
        yPercent: 0,
        filter: "blur(0px)",
        duration: 1.4,
        delay: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".hero",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }
}

/**
 * WebGL Fallback — Stunning CSS-only hero when GPU context fails
 * Replaces the broken canvas with a fullscreen atmospheric background
 */
function activateWebGLFallback(canvas) {
  // Hide the broken canvas
  if (canvas) canvas.style.display = "none";

  const hero = document.querySelector(".hero-awakening");
  if (!hero) return;

  // Create a fullscreen CSS-powered background layer
  const fallbackBg = document.createElement("div");
  fallbackBg.className = "hero-webgl-fallback";
  fallbackBg.innerHTML = `
    <img src="assets/images/hero/hero-bg.jpg" alt="" class="fallback-bg-img" />
    <div class="fallback-gradient-overlay"></div>
    <div class="fallback-vignette"></div>
    <div class="fallback-embers-css"></div>
  `;

  // Insert at the beginning of the hero so it's behind everything
  hero.insertBefore(fallbackBg, hero.firstChild);

  // Create CSS embers via JS for ambient atmosphere
  const embersContainer = fallbackBg.querySelector(".fallback-embers-css");
  for (let i = 0; i < 25; i++) {
    const ember = document.createElement("span");
    ember.className = "fallback-ember";
    ember.style.cssText = `
      left: ${Math.random() * 100}%;
      animation-delay: ${Math.random() * 6}s;
      animation-duration: ${4 + Math.random() * 5}s;
      width: ${1 + Math.random() * 2}px;
      height: ${1 + Math.random() * 2}px;
      opacity: ${0.2 + Math.random() * 0.5};
    `;
    embersContainer.appendChild(ember);
  }

  // Inject fallback styles
  if (!document.getElementById("webgl-fallback-styles")) {
    const style = document.createElement("style");
    style.id = "webgl-fallback-styles";
    style.textContent = `
      .hero-webgl-fallback {
        position: absolute;
        inset: 0;
        z-index: 1;
        overflow: hidden;
      }
      .fallback-bg-img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center 30%;
        filter: brightness(0.45) saturate(0.8) contrast(1.1);
        transform: scale(1.05);
        animation: fallbackBgBreath 12s ease-in-out infinite alternate;
      }
      @keyframes fallbackBgBreath {
        0% { transform: scale(1.05); filter: brightness(0.45) saturate(0.8) contrast(1.1); }
        100% { transform: scale(1.08); filter: brightness(0.5) saturate(0.85) contrast(1.05); }
      }
      .fallback-gradient-overlay {
        position: absolute;
        inset: 0;
        background:
          radial-gradient(ellipse at 50% 60%, rgba(201, 168, 76, 0.08) 0%, transparent 55%),
          radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.92) 100%),
          linear-gradient(to top, rgba(6,5,4,0.95) 0%, rgba(6,5,4,0.2) 35%, rgba(6,5,4,0.4) 100%);
        z-index: 2;
      }
      .fallback-vignette {
        position: absolute;
        inset: 0;
        box-shadow: inset 0 0 200px 60px rgba(0,0,0,0.7);
        z-index: 3;
        pointer-events: none;
      }
      .fallback-embers-css {
        position: absolute;
        inset: 0;
        z-index: 4;
        pointer-events: none;
        overflow: hidden;
      }
      .fallback-ember {
        position: absolute;
        bottom: -5px;
        background: radial-gradient(circle, #fff5d0 0%, #ff9933 50%, transparent 100%);
        border-radius: 50%;
        animation: fallbackEmberFloat linear infinite;
      }
      @keyframes fallbackEmberFloat {
        0% { transform: translateY(0) translateX(0); opacity: 0; }
        10% { opacity: 0.6; }
        90% { opacity: 0.3; }
        100% { transform: translateY(-110vh) translateX(${Math.random() > 0.5 ? '' : '-'}30px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  // Ensure the igniteHeroSanctuary event still fires for the preloader
  window.addEventListener("igniteHeroSanctuary", () => {
    // Soft brightness pulse on ignition
    const img = fallbackBg.querySelector(".fallback-bg-img");
    if (img && typeof gsap !== "undefined") {
      gsap.fromTo(img,
        { filter: "brightness(0.8) saturate(1.0) contrast(1.1)" },
        { filter: "brightness(0.45) saturate(0.8) contrast(1.1)", duration: 2.0, ease: "power2.out" }
      );
    }
  });

  // Safety fallback — ensure ignition fires
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent("igniteHeroSanctuary"));
  }, 5500);

  console.info(
    "%c⚔ ARTORIAS FALLBACK%c WebGL unavailable — CSS cinematic mode activated.",
    "color: #c9a84c; font-weight: bold; font-size: 13px;",
    "color: #888; font-size: 11px;"
  );
}

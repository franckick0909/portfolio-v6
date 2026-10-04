/* ══════════════════════════════════════════════════
   LIQUID GLASS MENU BACKGROUND (Three.js + GLSL)
   Oscar Pico / Codegrid "liquid glass" sphere transition
   - Wavy liquid rim (shared formula with the CSS clip-path polygon)
   - Crystal-ball refraction band near the rim (focus / magnifier)
   - Concentric liquid ripples, chromatic aberration, glass specular
   ══════════════════════════════════════════════════ */

// Same wave formula used by the shader AND by the CSS clip-path polygon
export function rimWave(angle, time, amp) {
  return (
    amp *
    (0.5 * Math.sin(3.0 * angle + 1.7 * time) +
      0.3 * Math.sin(5.0 * angle - 2.3 * time + 1.0) +
      0.2 * Math.sin(9.0 * angle + 3.1 * time + 2.0))
  );
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform vec2  uResolution;   // CSS px
  uniform vec2  uTextureSize;
  uniform float uRadius;       // lens radius in CSS px
  uniform float uDistort;      // 0 = flat glass, 1 = full liquid refraction
  uniform float uWave;         // rim wave amplitude (relative)
  uniform float uTime;
  uniform float uZoom;
  uniform float uRotation;

  varying vec2 vUv;

  vec2 coverUv(vec2 uv) {
    vec2 s = uResolution / uTextureSize;
    float scale = max(s.x, s.y);
    vec2 scaled = uTextureSize * scale;
    vec2 offset = (uResolution - scaled) * 0.5;
    return (uv * uResolution - offset) / scaled;
  }

  vec3 sampleImg(vec2 pPx) {
    vec2 uv = coverUv(pPx / uResolution + 0.5);
    // mirror at the borders so strong refraction never shows stretched edges
    uv = abs(mod(uv + 1.0, 2.0) - 1.0);
    return texture2D(uTexture, uv).rgb;
  }

  void main() {
    vec2 p = (vUv - 0.5) * uResolution;
    float len = length(p);
    float ang = atan(p.y, p.x);
    vec2 dir = p / max(len, 0.0001);

    // ── Liquid rim (identical to JS rimWave) ──
    float wave = uWave * (0.5 * sin(3.0 * ang + 1.7 * uTime)
                        + 0.3 * sin(5.0 * ang - 2.3 * uTime + 1.0)
                        + 0.2 * sin(9.0 * ang + 3.1 * uTime + 2.0));
    float R = max(uRadius * (1.0 + wave), 1.0);
    float d = len / R;                                    // 0 center → 1 rim
    float inside = 1.0 - smoothstep(1.0 - 1.5 / R, 1.0, d);

    // ── Crystal-ball magnifier band (Codegrid getLensDistortion) ──
    float focus = mix(0.0, 0.62, 1.0 - uDistort * 0.6);   // clear core grows as it settles
    float m = clamp((d - focus) / (1.0 - focus), 0.0, 1.0);
    m = pow(m, 2.2) * uDistort;

    // ── Global lens rotation ──
    float cRot = cos(uRotation), sRot = sin(uRotation);
    mat2 rotMat = mat2(cRot, -sRot, sRot, cRot);
    vec2 pRot = rotMat * p;

    // Swirl the band like liquid spinning inside the glass
    float swirl = m * 1.1 * sin(uTime * 0.8 + 0.5) + m * 0.6;
    float cs = cos(swirl), sn = sin(swirl);
    vec2 pr = mat2(cs, -sn, sn, cs) * pRot;

    // Refraction: pull samples toward the center (inverted crystal-ball look)
    vec2 sp = pr * (1.0 - 0.92 * m);

    // Concentric liquid ripples travelling outward
    float ripple = sin(d * 34.0 - uTime * 7.0) * (1.0 - d) * 0.018 * uDistort;
    ripple += sin(d * 13.0 - uTime * 3.0 + ang * 2.0) * 0.010 * uDistort;
    sp += dir * ripple * R;

    sp /= uZoom;

    // Chromatic aberration in the refraction band
    vec2 ca = dir * (m * 0.045 * R + 1.5 * uDistort);
    vec3 col;
    col.r = sampleImg(sp + ca).r;
    col.g = sampleImg(sp).g;
    col.b = sampleImg(sp - ca).b;

    // ── Image grading : keep the vibrant atmosphere of the artwork ──
    vec2 q = vUv - 0.5;
    col *= 1.0 - dot(q, q) * 0.65;

    // ── Glass rendering ──
    // inner shadow along the rim
    col *= 1.0 - smoothstep(0.55, 1.0, d) * 0.45 * uDistort;
    // fresnel glow line
    float fres = smoothstep(0.86, 0.995, d) * (1.0 - smoothstep(0.995, 1.0, d));
    col += vec3(1.0, 0.82, 0.6) * fres * 0.35 * uDistort;
    // specular highlight arc (top-left light)
    float specDir = max(dot(dir, normalize(vec2(-0.55, 0.8))), 0.0);
    float spec = pow(specDir, 6.0) * smoothstep(0.72, 0.96, d) * (1.0 - smoothstep(0.96, 1.0, d));
    col += vec3(1.0, 0.95, 0.88) * spec * 0.55 * uDistort;
    // faint bounce light bottom-right
    float bounce = pow(max(dot(dir, normalize(vec2(0.6, -0.8))), 0.0), 4.0)
                 * smoothstep(0.8, 0.99, d) * (1.0 - smoothstep(0.99, 1.0, d));
    col += vec3(0.9, 0.55, 0.25) * bounce * 0.25 * uDistort;

    gl_FragColor = vec4(col, inside);
  }
`;

export function createLiquidMenuBg(container, imageSrc) {
  if (typeof THREE === "undefined") {
    console.warn("[liquid-menu] THREE not loaded");
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.className = "menu-canvas";
  container.prepend(canvas);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch (e) {
    console.warn("[liquid-menu] WebGL unavailable", e);
    canvas.remove();
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.Camera();

  const uniforms = {
    uTexture: { value: null },
    uResolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    },
    uTextureSize: { value: new THREE.Vector2(1920, 1080) },
    uRadius: { value: 0 },
    uDistort: { value: 1 },
    uWave: { value: 0 },
    uTime: { value: 0 },
    uZoom: { value: 1 },
    uRotation: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

  new THREE.TextureLoader().load(imageSrc, (tex) => {
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    if ("colorSpace" in tex) tex.colorSpace = THREE.SRGBColorSpace;
    uniforms.uTexture.value = tex;
    uniforms.uTextureSize.value.set(tex.image.width, tex.image.height);
    render();
  });

  const api = { uniforms, play, stop, render, resize, onFrame: null };

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    uniforms.uResolution.value.set(w, h);
    render();
  }

  function render() {
    renderer.render(scene, camera);
  }

  // Render loop only while animating
  let running = false;
  const start = performance.now();
  function tick() {
    uniforms.uTime.value = (performance.now() - start) / 1000;
    if (api.onFrame) api.onFrame(uniforms.uTime.value);
    render();
  }
  function play() {
    if (running) return;
    running = true;
    gsap.ticker.add(tick);
  }
  function stop() {
    if (!running) return;
    running = false;
    gsap.ticker.remove(tick);
  }

  window.addEventListener("resize", resize);
  resize();

  return api;
}

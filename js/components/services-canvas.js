/**
 * services-canvas.js — Astral Forge 3D Canvas
 *
 * Expérience WebGL interactive pour la section Services :
 * - Astrolabe céleste en 3D (Sphère armillaire & anneaux runiques imbriqués)
 * - Nuage de particules de braises astrales en lévitation 3D
 * - Réactivité au curseur (parallaxe fluide & lueur directionnelle)
 * - Teinte dynamique selon le pacte de service survolé (Cyan, Or, Braise)
 * - Optimisation stricte 60 FPS (ne calcule que lorsque la section est visible)
 */

export function initServicesCanvas() {
  const section = document.querySelector(".section-services");
  const canvas = document.getElementById("services-forge-canvas");

  if (!section || !canvas || typeof THREE === "undefined") return;

  // 1. Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    55,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 24;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch (e) {
    console.warn("[services-canvas] WebGL non supporté", e);
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  // 2. Astrolabe Céleste 3D (Anneaux sacrés & Icosaèdre de la forge)
  const forgeGroup = new THREE.Group();
  scene.add(forgeGroup);

  // Matériaux avec couleurs animables
  const baseGold = new THREE.Color(0xc9a84c);
  const targetColor = new THREE.Color(0xc9a84c);
  const currentColor = new THREE.Color(0xc9a84c);

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: currentColor,
    wireframe: true,
    transparent: true,
    opacity: 0.28,
  });

  // Anneau 1 (Équatorial)
  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(8.5, 0.04, 16, 80),
    ringMaterial
  );
  forgeGroup.add(ring1);

  // Anneau 2 (Méridien)
  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(7.2, 0.04, 16, 80),
    ringMaterial
  );
  ring2.rotation.x = Math.PI / 2.8;
  forgeGroup.add(ring2);

  // Anneau 3 (Oblique)
  const ring3 = new THREE.Mesh(
    new THREE.TorusGeometry(5.8, 0.04, 16, 80),
    ringMaterial
  );
  ring3.rotation.y = Math.PI / 3.2;
  forgeGroup.add(ring3);

  // Cœur de l'Astrolabe : Icosaèdre cristallin
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: currentColor,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
  });
  const coreMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(3.2, 1),
    coreMaterial
  );
  forgeGroup.add(coreMesh);

  // 3. Nuage de Particules de Braises Astrales
  const particleCount = 280;
  const positions = new Float32Array(particleCount * 3);
  const scales = new Float32Array(particleCount);
  const driftSpeeds = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 45;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 35;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
    scales[i] = Math.random() * 0.12 + 0.04;
    driftSpeeds[i] = Math.random() * 0.008 + 0.003;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  // Création de texture de particule douce via canvas 2D
  const pCanvas = document.createElement("canvas");
  pCanvas.width = 32;
  pCanvas.height = 32;
  const pCtx = pCanvas.getContext("2d");
  const pGrad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
  pGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
  pGrad.addColorStop(0.35, "rgba(201, 168, 76, 0.8)");
  pGrad.addColorStop(1, "rgba(201, 168, 76, 0)");
  pCtx.fillStyle = pGrad;
  pCtx.fillRect(0, 0, 32, 32);

  const particleTexture = new THREE.CanvasTexture(pCanvas);

  const particleMaterial = new THREE.PointsMaterial({
    size: 1.2,
    map: particleTexture,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    color: currentColor,
  });

  const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleSystem);

  // 4. Interaction Souris & Parallaxe
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  window.addEventListener("mousemove", (e) => {
    const rect = section.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // 5. Teinte Dynamique selon les Cartes de Service Survolées
  const colorMap = {
    webgl: new THREE.Color(0x5ec5ff),   // Cyan spectral / Abysse
    vitrine: new THREE.Color(0xc9a84c), // Or antique / Forge royale
    refonte: new THREE.Color(0xff4d4d), // Flamme de forge / Braise
  };

  const pactCards = document.querySelectorAll(".pact-card");
  pactCards.forEach((card) => {
    const serviceType = card.querySelector(".pact-btn")?.getAttribute("data-service");
    
    card.addEventListener("mouseenter", () => {
      if (serviceType && colorMap[serviceType]) {
        targetColor.copy(colorMap[serviceType]);
      }
    });

    card.addEventListener("mouseleave", () => {
      targetColor.copy(baseGold);
    });
  });

  // 6. Gestion du Resize
  function handleResize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener("resize", handleResize);

  // 7. Visibilité & Boucle d'Animation (IntersectionObserver pour 0% CPU hors écran)
  let isVisible = false;
  const observer = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0].isIntersecting;
    },
    { rootMargin: "150px" }
  );
  observer.observe(section);

  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    if (!isVisible) return;

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Lerp de couleur fluide
    currentColor.lerp(targetColor, 0.04);
    ringMaterial.color.copy(currentColor);
    coreMaterial.color.copy(currentColor);
    particleMaterial.color.copy(currentColor);

    // Parallaxe souris avec amorti
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    forgeGroup.position.x = mouseX * 2.5;
    forgeGroup.position.y = -mouseY * 2.0;

    // Rotation poly-axiale de l'Astrolabe
    ring1.rotation.z += delta * 0.22;
    ring2.rotation.y += delta * 0.28;
    ring3.rotation.x += delta * 0.18;
    coreMesh.rotation.y += delta * 0.45;
    coreMesh.rotation.x = Math.sin(elapsedTime * 0.6) * 0.3;

    // Dérive douce des particules
    const pos = particleGeometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3 + 1] += driftSpeeds[i];
      if (pos[i * 3 + 1] > 18) {
        pos[i * 3 + 1] = -18;
      }
    }
    particleGeometry.attributes.position.needsUpdate = true;
    particleSystem.rotation.y = elapsedTime * 0.03;

    renderer.render(scene, camera);
  }

  handleResize();
  animate();
}

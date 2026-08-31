/**
 * dragon3d.js — 3D Dragon WebGL Experience for The Chronicle
 * Powered by Three.js & GLTFLoader
 * - Asynchronous loading of Meshy AI 3D Dragon GLB
 * - Dark fantasy cinematic dual-tone lighting (Golden amber & Moonlit rim)
 * - Scroll-driven 3D flight trajectory (dive & bank)
 * - Continuous aerodynamic hover & wind breathing
 * - Fluid interactive cursor parallax
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function init3DDragon() {
    const container = document.getElementById('chronicle3dDragon');
    const section = document.querySelector('.section-chronicle');
    if (!container || !section) return;

    console.log('🐉 Initialisation du Dragon 3D WebGL...');

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        42,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 9);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // 3. Brume atmosphérique Three.js (voile vaporeux estompant le dragon)
    scene.fog = new THREE.FogExp2(0x121720, 0.055);

    // 4. Éclairage cinématique blanchâtre / brumeux
    // A. Lumière d'ambiance laiteuse mystique
    const ambientLight = new THREE.AmbientLight(0xd5e2f0, 2.2);
    scene.add(ambientLight);

    // B. Lumière blanche diaphane (comme un rayon à travers la brume)
    const keyLight = new THREE.DirectionalLight(0xf4f8ff, 3.2);
    keyLight.position.set(4, 7, 5);
    scene.add(keyLight);

    // C. Contre-jour bleuté argenté
    const rimLight = new THREE.DirectionalLight(0x94b4d0, 3.6);
    rimLight.position.set(-6, -1, -4);
    scene.add(rimLight);

    // D. Halo de brume douce
    const mistGlow = new THREE.PointLight(0xb5d2ee, 2.2, 16);
    mistGlow.position.set(0, 0, 2);
    scene.add(mistGlow);

    // 5. Groupe Dragon
    const dragonGroup = new THREE.Group();
    scene.add(dragonGroup);

    // Position initiale : visible dès le HAUT de la section, plus petit et reculé
    dragonGroup.position.set(1.8, 1.8, -1.8);
    dragonGroup.rotation.set(0.1, -0.65, 0.18);

    let isLoaded = false;
    const clock = new THREE.Clock();

    // 6. Chargement asynchrone du modèle GLB
    const loader = new GLTFLoader();
    const modelUrl = 'assets/models/dragon.glb';

    loader.load(
        modelUrl,
        (gltf) => {
            const model = gltf.scene;

            // Optimisation des matériaux pour le rendu brumeux
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child.material) {
                        child.material.roughness = 0.75;
                        child.material.metalness = 0.15;
                    }
                }
            });

            // Normalisation de la taille : dragon plus petit et discret (1.8 au lieu de 2.6)
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const targetScale = 1.8 / maxDim;

            model.scale.set(targetScale, targetScale, targetScale);
            model.position.sub(center.multiplyScalar(targetScale));

            dragonGroup.add(model);
            isLoaded = true;

            // Révélation en fondu enchaîné doux
            container.classList.add('loaded');

            // 7. Trajectoire de vol 3D en zigzag au ScrollTrigger
            setupScrollFlight(dragonGroup, section);
        },
        undefined,
        (error) => {
            console.warn('Note: Chargement du modèle 3D Dragon :', error);
        }
    );

    // 8. Trajectoire en zigzag débutant en haut et disparaissant hors écran
    function setupScrollFlight(group, triggerElement) {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        const flightTl = gsap.timeline({
            scrollTrigger: {
                trigger: triggerElement,
                start: 'top 90%',
                end: 'bottom top',
                scrub: 1.3,
            }
        });

        // Étape 1 (Haut de section) : plonge depuis le haut-droit vers le centre-gauche
        flightTl.to(group.position, {
            x: -1.7,
            y: 0.6,
            z: -1.0,
            ease: 'power1.inOut',
        }, 0);
        flightTl.to(group.rotation, {
            x: 0.28,
            y: 0.6,
            z: -0.28,
            ease: 'power1.inOut',
        }, 0);

        // Étape 2 (Milieu de section) : zigzag et traverse vers la droite avec virage
        flightTl.to(group.position, {
            x: 1.9,
            y: -1.2,
            z: -1.4,
            ease: 'power1.inOut',
        }, 0.35);
        flightTl.to(group.rotation, {
            x: 0.12,
            y: -0.7,
            z: 0.32,
            ease: 'power1.inOut',
        }, 0.35);

        // Étape 3 (Bas de section) : replonge en diagonale vers le bas-gauche et DISPARAÎT hors écran
        flightTl.to(group.position, {
            x: -4.8,
            y: -4.5,
            z: 0.4,
            ease: 'power1.in',
        }, 0.75);
        flightTl.to(group.rotation, {
            x: 0.45,
            y: 0.95,
            z: -0.4,
            ease: 'power1.in',
        }, 0.75);
    }

    // 9. Suivi interactif de la souris (LookAt doux)
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // 9. Boucle d'animation & Rendu
    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const elapsedTime = clock.getElapsedTime();

        if (isLoaded) {
            // A. Oscillation organique continue (vent & portance)
            const floatY = Math.sin(elapsedTime * 1.3) * 0.12;
            const bankZ = Math.cos(elapsedTime * 0.9) * 0.04;
            const pitchX = Math.sin(elapsedTime * 1.1) * 0.03;

            // B. Amorti fluide vers le curseur (lerp)
            targetX += (mouseX - targetX) * 0.04;
            targetY += (mouseY - targetY) * 0.04;

            // Application subtile des micro-mouvements sans perturber le scroll
            dragonGroup.position.y += floatY * 0.08;
            dragonGroup.rotation.z += bankZ * 0.06;
            dragonGroup.rotation.y += targetX * 0.008;
            dragonGroup.rotation.x += targetY * 0.006 + pitchX * 0.05;
        }

        renderer.render(scene, camera);
    }

    animate();

    // 10. Responsive resize
    window.addEventListener('resize', () => {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });
}

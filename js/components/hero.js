/**
 * hero.js — Three.js Dark Fantasy Atmosphere
 * Volumetric fog, floating embers, pulsating glow
 */

export function initHero() {
    const canvas = document.getElementById('souls-canvas');
    if (!canvas) return;

    if (typeof THREE === 'undefined') {
        console.error('THREE.js not loaded!');
        return;
    }

    // ── Scene Setup ──
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.015);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050505);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;

    // ── Ember Particles ──
    const emberCount = 800;
    const emberGeometry = new THREE.BufferGeometry();
    const emberPositions = new Float32Array(emberCount * 3);
    const emberSizes = new Float32Array(emberCount);
    const emberSpeeds = new Float32Array(emberCount);
    const emberDrifts = new Float32Array(emberCount);

    for (let i = 0; i < emberCount; i++) {
        // Spread across a large area
        emberPositions[i * 3] = (Math.random() - 0.5) * 60;     // x
        emberPositions[i * 3 + 1] = Math.random() * 40 - 5;     // y
        emberPositions[i * 3 + 2] = (Math.random() - 0.5) * 40; // z

        emberSizes[i] = Math.random() * 3 + 0.5;
        emberSpeeds[i] = Math.random() * 0.02 + 0.005;
        emberDrifts[i] = (Math.random() - 0.5) * 0.01;
    }

    emberGeometry.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));
    emberGeometry.setAttribute('size', new THREE.BufferAttribute(emberSizes, 1));

    // Custom shader for embers with glow
    const emberMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uColor1: { value: new THREE.Color(0xc9a84c) },  // Gold
            uColor2: { value: new THREE.Color(0xff6b35) },  // Orange
            uColor3: { value: new THREE.Color(0x8b1a1a) },  // Blood red
        },
        vertexShader: `
            attribute float size;
            varying float vAlpha;
            varying float vColorMix;
            uniform float uTime;

            void main() {
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                float dist = length(mvPosition.xyz);
                vAlpha = smoothstep(50.0, 5.0, dist) * (0.3 + 0.7 * sin(uTime * 2.0 + position.x * 3.0) * 0.5 + 0.5);
                vColorMix = sin(position.y * 0.5 + uTime) * 0.5 + 0.5;
                gl_PointSize = size * (200.0 / -mvPosition.z);
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

                float glow = 1.0 - smoothstep(0.0, 0.5, d);
                glow = pow(glow, 2.0);

                vec3 color = mix(uColor1, uColor2, vColorMix);
                color = mix(color, uColor3, smoothstep(0.6, 1.0, vColorMix));

                gl_FragColor = vec4(color, glow * vAlpha * 0.8);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    const embers = new THREE.Points(emberGeometry, emberMaterial);
    scene.add(embers);

    // ── Fog Particles (larger, dimmer, slower) ──
    const fogCount = 200;
    const fogGeometry = new THREE.BufferGeometry();
    const fogPositions = new Float32Array(fogCount * 3);
    const fogSizes = new Float32Array(fogCount);

    for (let i = 0; i < fogCount; i++) {
        fogPositions[i * 3] = (Math.random() - 0.5) * 80;
        fogPositions[i * 3 + 1] = Math.random() * 20 - 5;
        fogPositions[i * 3 + 2] = (Math.random() - 0.5) * 50 - 10;
        fogSizes[i] = Math.random() * 30 + 10;
    }

    fogGeometry.setAttribute('position', new THREE.BufferAttribute(fogPositions, 3));
    fogGeometry.setAttribute('size', new THREE.BufferAttribute(fogSizes, 1));

    const fogMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
        },
        vertexShader: `
            attribute float size;
            varying float vAlpha;
            uniform float uTime;

            void main() {
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vAlpha = smoothstep(80.0, 10.0, length(mvPosition.xyz)) * 0.08;
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying float vAlpha;

            void main() {
                float d = length(gl_PointCoord - vec2(0.5));
                if (d > 0.5) discard;
                float soft = 1.0 - smoothstep(0.0, 0.5, d);
                soft = pow(soft, 1.5);
                gl_FragColor = vec4(0.4, 0.35, 0.3, soft * vAlpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    const fog = new THREE.Points(fogGeometry, fogMaterial);
    scene.add(fog);

    // ── Central Glow (distant bonfire/fire) ──
    const glowLight = new THREE.PointLight(0xc9a84c, 2, 40);
    glowLight.position.set(0, -2, -10);
    scene.add(glowLight);

    const glowLight2 = new THREE.PointLight(0xff6b35, 1, 25);
    glowLight2.position.set(3, 0, -8);
    scene.add(glowLight2);

    // Ambient for minimal fill
    const ambient = new THREE.AmbientLight(0x1a1510, 0.3);
    scene.add(ambient);

    // ── Mouse Interaction ──
    const mouse = { x: 0, y: 0 };
    const targetRotation = { x: 0, y: 0 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        targetRotation.x = mouse.y * 0.03;
        targetRotation.y = mouse.x * 0.05;
    });

    // ── CSS Embers (HTML overlay) ──
    createHeroEmbers();

    // ── Animation Loop ──
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();
        const delta = clock.getDelta();

        // Update ember positions (float upward)
        const positions = emberGeometry.attributes.position.array;
        for (let i = 0; i < emberCount; i++) {
            positions[i * 3 + 1] += emberSpeeds[i];        // y: rise
            positions[i * 3] += emberDrifts[i];              // x: drift
            positions[i * 3] += Math.sin(elapsed + i) * 0.002; // x: sway

            // Reset when too high
            if (positions[i * 3 + 1] > 35) {
                positions[i * 3 + 1] = -5;
                positions[i * 3] = (Math.random() - 0.5) * 60;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
            }
        }
        emberGeometry.attributes.position.needsUpdate = true;

        // Update fog positions (slow drift)
        const fogPos = fogGeometry.attributes.position.array;
        for (let i = 0; i < fogCount; i++) {
            fogPos[i * 3] += Math.sin(elapsed * 0.1 + i * 0.3) * 0.01;
            fogPos[i * 3 + 1] += Math.cos(elapsed * 0.05 + i * 0.5) * 0.003;
        }
        fogGeometry.attributes.position.needsUpdate = true;

        // Update uniforms
        emberMaterial.uniforms.uTime.value = elapsed;
        fogMaterial.uniforms.uTime.value = elapsed;

        // Pulsating glow
        glowLight.intensity = 2 + Math.sin(elapsed * 0.8) * 0.5;
        glowLight2.intensity = 1 + Math.sin(elapsed * 1.2 + 1) * 0.3;

        // Smooth camera rotation (parallax mouse)
        camera.rotation.x += (targetRotation.x - camera.rotation.x) * 0.02;
        camera.rotation.y += (targetRotation.y - camera.rotation.y) * 0.02;

        renderer.render(scene, camera);
    }
    animate();

    // ── Resize Handler ──
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

/**
 * Create floating CSS embers in the hero overlay
 */
function createHeroEmbers() {
    const container = document.getElementById('embersContainer');
    if (!container) return;

    for (let i = 0; i < 40; i++) {
        const ember = document.createElement('div');
        const size = Math.random() * 3 + 1;
        const isGold = Math.random() > 0.4;
        const color = isGold ? '#c9a84c' : '#ff6b35';

        ember.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            bottom: -5%;
            opacity: 0;
            pointer-events: none;
            box-shadow: 0 0 ${size * 2}px ${color};
        `;
        container.appendChild(ember);

        animateEmber(ember);
    }
}

function animateEmber(ember) {
    const duration = Math.random() * 6 + 4;
    const delay = Math.random() * 5;

    gsap.fromTo(ember,
        {
            y: 0,
            x: 0,
            opacity: 0,
            left: `${Math.random() * 100}%`,
        },
        {
            y: -(window.innerHeight * 1.2),
            x: (Math.random() - 0.5) * 300,
            opacity: Math.random() * 0.6 + 0.2,
            duration,
            delay,
            ease: 'none',
            onComplete: () => {
                gsap.set(ember, { y: 0, opacity: 0 });
                animateEmber(ember);
            }
        }
    );
}

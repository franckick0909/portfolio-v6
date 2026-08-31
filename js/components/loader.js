/**
 * loader.js — Dark Fantasy Preloader
 * - Rolling counter (trionn.com style)
 * - Rune circle as progress bar
 * - Old clip-path exit animation
 * - New fire-inscription title reveal
 */

/* ── Vanilla SplitText avec mask ── */
function splitChars(selector) {
    const els = document.querySelectorAll(selector);
    els.forEach(el => {
        const text = el.textContent;
        el.textContent = '';
        text.split('').forEach(char => {
            const mask = document.createElement('span');
            mask.className = 'char-mask';
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char === ' ' ? '\u00A0' : char;
            mask.appendChild(span);
            el.appendChild(mask);
        });
    });
}

/* ── Create preloader ember particles ── */
function createPreloaderEmbers() {
    const container = document.querySelector('.preloader-embers');
    if (!container) return;

    for (let i = 0; i < 25; i++) {
        const ember = document.createElement('div');
        ember.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3 + 1}px;
            height: ${Math.random() * 3 + 1}px;
            background: radial-gradient(circle, #c9a84c, #ff6b35);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            bottom: -10px;
            opacity: 0;
            pointer-events: none;
            filter: blur(${Math.random() * 0.5}px);
            box-shadow: 0 0 ${Math.random() * 4 + 2}px rgba(201, 168, 76, 0.6);
        `;
        container.appendChild(ember);

        gsap.to(ember, {
            y: -(window.innerHeight + 50),
            x: (Math.random() - 0.5) * 200,
            opacity: Math.random() * 0.7 + 0.2,
            duration: Math.random() * 4 + 3,
            delay: Math.random() * 2,
            repeat: -1,
            ease: 'power1.inOut',
            onRepeat: () => {
                gsap.set(ember, {
                    left: `${Math.random() * 100}%`,
                    y: 0,
                    opacity: 0,
                });
            }
        });
    }
}

/* ── Rolling counter (trionn.com style) ── */
function animateRollingCounter(onProgress) {
    const hundreds = document.getElementById('digitHundreds');
    const tens = document.getElementById('digitTens');
    const ones = document.getElementById('digitOnes');

    if (!hundreds || !tens || !ones) return;

    // We know from CSS that each digit is exactly 1.2em tall.
    // We can animate the `y` property as a percentage of the total height, or using ems.
    const counter = { value: 0 };

    gsap.to(counter, {
        value: 100,
        duration: 3,
        ease: 'power2.inOut',
        onUpdate: () => {
            const val = Math.round(counter.value);
            const h = Math.floor(val / 100);
            const t = Math.floor((val % 100) / 10);
            const o = val % 10;

            // Slide each digit column using CSS rem units (1.2rem height)
            gsap.set(hundreds, { y: `-${h * 1.2}rem` });
            gsap.set(tens, { y: `-${t * 1.2}rem` });
            gsap.set(ones, { y: `-${o * 1.2}rem` });

            // Report progress

            if (onProgress) onProgress(val / 100);
        },
    });
}

export function initLoader() {
    console.log('⏳ Dark Fantasy Loader initialisé');

    /* ── Split titles into chars ── */
    splitChars('.title-line'); // Only split once

    /* ── Initial states ── */
    // Titre arrive du bas avec un blur
    gsap.set('.preloader-header .char', { 
        yPercent: 120, 
        filter: 'blur(10px)',
        opacity: 0 // Optional fallback
    });
    
    // Compteur arrive du bas
    gsap.set('.preloader-counter', { 
        yPercent: 120,
        opacity: 0 
    });

    /* ── Wrap images for true independent scale/clip-path (Fame Estate / La Crapule style) ── */
    const galleryImages = document.querySelectorAll('.preloader-img');
    galleryImages.forEach(img => {
        const wrapper = document.createElement('div');
        wrapper.className = 'preloader-img-wrap';
        wrapper.style.position = 'absolute';
        wrapper.style.top = '0';
        wrapper.style.left = '0';
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.style.willChange = 'clip-path, transform';
        wrapper.style.overflow = 'hidden';
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        
        // Remove active class opacity tricks if any, handled by gsap
        img.style.opacity = '1';
    });

    const wrappers = document.querySelectorAll('.preloader-img-wrap');
    const inners = document.querySelectorAll('.preloader-img');

    const preloaderImgInitRotations = [7.5, -2.5, -10, 12.5, -5, 5];

    // Set initial states
    // WRAPPER controls rotation, scale and clipPath (masking)
    gsap.set(wrappers, {
        rotation: (i) => preloaderImgInitRotations[i] || 0,
        scale: 0, // Code from about.js: scale starts at 0
        clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)', // Center collapsed
    });

    // INNER IMAGE controls the inner zoom-out parallax
    gsap.set(inners, {
        scale: 1.5, // Code from about.js: inner image starts at 1.5
        opacity: 1, 
        transformOrigin: '50% 50%',
    });

    /* ── Start ember particles ── */
    createPreloaderEmbers();

    /* ── Main Timeline ── */
    const tl = gsap.timeline({ delay: 0.3 });

    /* ① ENTRANCE : Double scale + clip-path (like about.js) */
    
    // Le cadre (wrapper) s'ouvre depuis le centre et scale de 0 à 1
    tl.to(wrappers, {
        rotation: 0,
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        scale: 1,
        duration: 1.5, // from about.js
        ease: 'power3.out', // equivalent to fame-out-expo
        stagger: 0.15,
    }, 0);

    // L'image à l'intérieur dé-zoome doucement (parallaxe) de 1.5 à 1
    tl.to(inners, {
        scale: 1,
        duration: 1.5, // from about.js
        ease: 'power3.out', // equivalent to fame-out-quint
        stagger: 0.15,
    }, 0);

    /* ② Title chars reveal (Arrive du bas avec blur) */
    tl.to('.preloader-header .char', {
        yPercent: 0,
        filter: 'blur(0px)',
        opacity: 1,
        duration: 1.2,
        ease: 'power4.out',
        stagger: { each: 0.05, from: 'start' },
    }, 0.5);

    /* ② Counter appears (Arrive du bas) + rolling animation */
    tl.to('.preloader-counter', {
        yPercent: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power4.out',
        onStart: () => {
            animateRollingCounter();
        },
    }, 0.8);

    /* ③ EXIT — Images : "Aspiration" / Implosion */
    // Le cadre se referme sur le centre et scale de 1 à 0 (Aspiration)
    tl.to(wrappers, {
        clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
        scale: 0,
        duration: 0.8,
        ease: 'power3.in',
        stagger: { each: 0.08, from: 'end' },
    }, 3.5);

    // L'image à l'intérieur continue de dézoomer (1 -> 0.5) pour la sensation d'aspiration
    tl.to(inners, {
        scale: 0.5,
        duration: 0.8,
        ease: 'power3.in',
        stagger: { each: 0.08, from: 'end' },
    }, 3.5);

    /* EXIT — 1. Counter part en premier vers le haut */
    tl.to('.preloader-counter', {
        yPercent: -120,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.in',
    }, 3.8); // Part juste avant le titre

    /* EXIT — 2. Titre part ensuite vers le haut avec un blur-out */
    tl.to('.preloader-header .char', {
        yPercent: -120,
        filter: 'blur(10px)',
        opacity: 0,
        duration: 0.5,
        ease: 'power3.in',
        stagger: { each: 0.02, from: 'start' },
    }, 4.0); // Le titre part après le compteur

    /* ④ Le preloader se referme vers le haut (Wipe final) */
    tl.to('.preloader', {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
        duration: 1.5, // Plus lent
        ease: 'hop',
    }, 4.35);

    /* Preloader background fades out to reveal Hero */
    tl.to('.preloader', {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.inOut',
    }, 5.0); // Décalé pour correspondre à la nouvelle durée du wipe

    tl.set('.preloader', { display: 'none' });

    /* ⑤ Hero content enters — Fire inscription animation */

    /* Title: each letter inscribed by fire (scale + glow + blur) */
    tl.fromTo('.souls-title .char', {
        opacity: 0,
        scale: 1.4,
        filter: 'blur(8px)',
        textShadow: '0 0 50px rgba(255, 150, 50, 1)',
    }, {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        textShadow: '0 0 30px rgba(201, 168, 76, 0.3)',
        duration: 0.7,
        stagger: { each: 0.06, from: 'center' },
        ease: 'power3.out',
    }, 5.5);

    /* Title container fade in */
    tl.to('.souls-title', {
        opacity: 1,
        duration: 0.01,
    }, 5.49);

    /* Horizon line & Darksign expand with golden flare across the title */
    tl.fromTo('.title-horizon-line', {
        scaleX: 0,
        opacity: 1,
    }, {
        scaleX: 1,
        opacity: 1,
        duration: 1.3,
        ease: 'power3.out',
    }, 6.2);

    tl.fromTo('.darksign-ring', {
        scale: 0.4,
        opacity: 0,
    }, {
        scale: 1,
        opacity: 0.85,
        duration: 1.4,
        ease: 'power2.out',
    }, 5.7);

    /* Menu links appear with Dark Souls mystical focus:
       Emerge from haze (blur 8px -> 0px) and opacity 0 -> 1 directly in place, sans aucun mouvement Y */
    tl.fromTo('.souls-link', {
        opacity: 0,
        filter: 'blur(8px)',
    }, {
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.9,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'filter',
    }, 6.0);

    /* Active link's golden ambient glow softly ignites */
    tl.fromTo('.souls-link.active .link-glow', {
        opacity: 0,
        scale: 0.6,
    }, {
        opacity: 1,
        scale: 1,
        duration: 1.1,
        ease: 'power2.out',
    }, 6.5);

    /* Side markers & copyright fade in */
    tl.to('.hero-side, .hero-copyright', {
        opacity: 1,
        duration: 1.2,
        ease: 'power2.out',
    }, 6.5);

    /* Scroll indicator */
    tl.to('.scroll-indicator', {
        opacity: 0.75,
        duration: 1.1,
        ease: 'power2.out',
    }, 6.8);
}

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
    splitChars('.preloader-header .logo-text');

    /* ── Initial states ── */
    // Titre arrive du bas avec un blur
    gsap.set('.preloader-header .char', { 
        yPercent: 120, 
        filter: 'blur(10px)',
        opacity: 0
    });
    gsap.set('.preloader-header .logo-svg', { 
        yPercent: 120, 
        opacity: 0
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
    tl.to('.preloader-header .char, .preloader-header .logo-svg', {
        yPercent: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'power4.out',
        stagger: { each: 0.05, from: 'start' },
    }, 0.5);
    tl.to('.preloader-header .char', {
        filter: 'blur(0px)',
        duration: 1.2,
        ease: 'power4.out',
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

    /* ③ EXIT — All images EXCEPT the last one collapse inward */
    const lastIndex = wrappers.length - 1;
    const otherWrappers = Array.from(wrappers).filter((_, i) => i !== lastIndex);
    const otherInners = Array.from(inners).filter((_, i) => i !== lastIndex);

    // Other images: aspiration (collapse)
    tl.to(otherWrappers, {
        clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
        scale: 0,
        duration: 0.8,
        ease: 'power3.in',
        stagger: { each: 0.08, from: 'end' },
    }, 3.5);

    tl.to(otherInners, {
        scale: 0.5,
        duration: 0.8,
        ease: 'power3.in',
        stagger: { each: 0.08, from: 'end' },
    }, 3.5);

    /* Last image: stays visible, holds for a beat */
    // (It's already at scale: 1 and full clip-path from the entrance)

    /* EXIT — Counter leaves */
    tl.to('.preloader-counter', {
        yPercent: -120,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.in',
    }, 3.8);

    /* EXIT — Title leaves */
    tl.to('.preloader-header .char, .preloader-header .logo-svg', {
        yPercent: -120,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.in',
        stagger: { each: 0.02, from: 'start' },
    }, 4.0);
    tl.to('.preloader-header .char', {
        filter: 'blur(10px)',
        duration: 0.5,
        ease: 'power3.in',
    }, 4.0);

    /* ④ Last image morphs to match .navbar-background position */
    // Get the navbar-background's position/size (the 16:9 centered block)
    const navbarBg = document.querySelector('.navbar-background');
    if (navbarBg) {
        const navRect = navbarBg.getBoundingClientRect();
        const gallery = document.querySelector('.preloader-gallery');
        const galleryRect = gallery.getBoundingClientRect();

        // Calculate the transform needed to move the last image
        // from its current gallery position to the navbar-background position
        const scaleX = navRect.width / galleryRect.width;
        const scaleY = navRect.height / galleryRect.height;
        const moveX = (navRect.left + navRect.width / 2) - (galleryRect.left + galleryRect.width / 2);
        const moveY = (navRect.top + navRect.height / 2) - (galleryRect.top + galleryRect.height / 2);

        // Animate the last wrapper to match navbar-background exactly
        tl.to(wrappers[lastIndex], {
            x: moveX,
            y: moveY,
            scaleX: scaleX,
            scaleY: scaleY,
            duration: 1.2,
            ease: 'power3.inOut',
        }, 4.2);

        // Inner image counter-scales to maintain appearance
        tl.to(inners[lastIndex], {
            scale: 1,
            duration: 1.2,
            ease: 'power3.inOut',
        }, 4.2);
    }

    /* ⑤ Reveal the real navbar-background (same image, seamless handoff) */
    tl.to('.navbar-background', {
        opacity: 1,
        duration: 0.3,
        ease: 'none',
    }, 5.2);

    /* Preloader fades out — the navbar-background is now visible behind it */
    tl.to('.preloader', {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.inOut',
    }, 5.3);

    tl.set('.preloader', { display: 'none' });

    /* ⑥ Hero elements enter — menu links, logo, side markers */

    /* Menu links fade in with stagger */
    tl.fromTo('.navbar-links a', {
        yPercent: 40,
        opacity: 0,
    }, {
        yPercent: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
    }, 5.5);

    /* Logo enters */
    tl.fromTo('.navbar-logo', {
        opacity: 0,
        y: 20,
    }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
    }, 5.6);

    /* Side markers & copyright */
    tl.to('.hero-side, .hero-copyright', {
        opacity: 1,
        duration: 1.3,
        ease: 'power2.out',
    }, 5.8);

    /* Scroll indicator — arrives last */
    tl.to('.scroll-indicator', {
        opacity: 0.75,
        duration: 1.2,
        ease: 'power2.out',
    }, 6.0);

    /* Dispatch heroRevealed event */
    tl.add(() => {
        window.dispatchEvent(new CustomEvent('heroRevealed'));
    }, 6.5);
}

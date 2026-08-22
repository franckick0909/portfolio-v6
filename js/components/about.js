/* ── about.js — ÉTAPE 1+2 : Revealer + Images cascade ── */

export function initAbout() {

    const wrapper  = document.querySelector('.about-wrapper');
    const revealer = document.querySelector('.about-revealer');
    const imgs     = document.querySelectorAll('.about-img');

    if (!wrapper || !revealer) {
        console.warn('[about.js] Éléments manquants');
        return;
    }

    // État initial : clipPath au centre (opacity 0 géré par CSS)
    gsap.set(revealer, {
        clipPath: 'polygon(49.8% 50%, 50.2% 50%, 50.2% 50%, 49.8% 50%)'
    });

    gsap.set(imgs, {
        clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)'
    });
    
    // Scale initial des images pour effet zoom-out
    gsap.set('.about-img img', {
        scale: 1.5
    });

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: wrapper,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            invalidateOnRefresh: true,
        }
    });

    // ── ÉTAPE A : Le texte initial disparaît ──
    if (document.querySelector('.about-content')) {
        tl.to('.about-content', { 
            opacity: 0,
            scale: 0.9,
            duration: 0.2
        }, '0');
    }

    // ── ÉTAPE B : Le voile rouge se dessine ──
    // fromTo force l'opacité à 0 quand on scroll en arrière
    tl.fromTo(revealer, { opacity: 0 }, { opacity: 1, duration: 0.01 }, 0);
    tl.to(revealer, {
        clipPath: 'polygon(49.8% 0%, 50.2% 0%, 50.2% 100%, 49.8% 100%)',
        duration: 0.2,
        ease: 'none'
    }, 0);

    tl.to(revealer, {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        duration: 0.6,
        ease: 'fame-in-out-quint'
    });

    // ── ÉTAPE C : Les images se révèlent (clip-path) avec effet zoom-out ──
    if (imgs.length > 0) {
        imgs.forEach((img, i) => {
            const startTime = i === 0 ? '<0.31' : '<0.12';
            
            // Rend l'image visible EXACTEMENT quand son animation commence
            tl.fromTo(img, { opacity: 0 }, { opacity: 1, duration: 0.01 }, startTime);

            // Le cadre de l'image s'ouvre depuis le centre
            tl.fromTo(img, { 
                clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
                scale: 0
            }, {
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                scale: 1,
                duration: 1.5,
                ease: 'fame-out-expo',
                immediateRender: false
            }, '<');

            // L'image à l'intérieur dé-zoome doucement (parallaxe)
            const imageInside = img.querySelector('img');
            if (imageInside) {
                tl.fromTo(imageInside, { scale: 1.5 }, {
                    scale: 1,
                    duration: 1.5,
                    ease: 'fame-out-quint',
                    immediateRender: false
                }, '<');
            }
        });
    }

    // ── ÉTAPE D : Le bloc rouge final arrive en scale au centre ──
    const finalBlock = document.querySelector('.about-final-block');
    const finalLeft = document.querySelector('.about-final-half.left');
    const finalRight = document.querySelector('.about-final-half.right');

    if (finalBlock && finalLeft && finalRight) {
        // Apparition du bloc rouge (dure 1s)
        tl.fromTo(finalBlock, { opacity: 1, scale: 0 }, {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'fame-out-quint',
            immediateRender: false
        }, '<0.15');

        // On ajoute un petit délai (0.5s) pour laisser le temps au scroll
        // d'amener la section blanche juste en bas de l'écran (-200svh margin)
        tl.to({}, { duration: 0.5 });

        // On remplace le tl.set par un tl.to de 0.01s pour éviter les bugs GSAP au refresh
        tl.to(['.about-bg', '.about-revealer', ...imgs], { opacity: 0, duration: 0.01 }); 

        // Split des deux moitiés du rideau (dure 1s pour finir la timeline)
        // La section blanche défile exactement pendant cette seconde !
        tl.to(finalLeft, {
            xPercent: -100,
            duration: 1,
            ease: 'fame-in-out-quint'
        }, '>');

        tl.to(finalRight, {
            xPercent: 100,
            duration: 1,
            ease: 'fame-in-out-quint'
        }, '<');
    }
}

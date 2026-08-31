/**
 * about.js — The Chronicle & Project Grid Animations
 * - 3 emplacements de texte About animés ligne par ligne (line-mask)
 * - Révélation des images des cartes façon Loader (ouverture polygone + dézoom interne)
 * - Animation des titres de cartes : découpage char par char en X avec flou (blur)
 * - Animation des card-num en yPercent dans leur masque
 * - Synchronisation globale stagger au ScrollTrigger ("pas trop tôt")
 * - Parallaxe intra-image et inclinaison 3D au survol
 */

export function initAbout() {
    const section = document.querySelector('.section-chronicle');
    if (!section) return;

    console.log('📜 Initialisation des animations de la section About (Chronicle)...');

    // 1. Textes About animés ligne par ligne
    initTextCards();

    // 2. Révélations synchronisées des cartes de projets (Loader style + char X/blur + num yPercent)
    initCardReveals();

    // 3. Parallaxe intra-image scrubée
    initCardImageParallax();

    // 4. Décalage multi-plans des colonnes
    initColumnParallax();

    // 5. Hover ultra-smooth façon Amine Zegmou (piloté par GSAP)
    initCardHoverSmooth();
}

/**
 * 1. Textes About animés par ligne avec masque strict (Inspiré par Osmo SplitText)
 * Chaque ligne réelle est découpée et enveloppée dans son propre conteneur overflow: hidden
 */
function initTextCards() {
    const textCards = document.querySelectorAll('.about-text-card');

    textCards.forEach((card) => {
        const targets = card.querySelectorAll('[data-split="line"]');
        if (!targets.length) return;

        const allLines = [];

        targets.forEach((target) => {
            if (typeof SplitText !== 'undefined') {
                // Découpage automatique des vraies lignes de texte
                const split = new SplitText(target, {
                    type: 'lines',
                    linesClass: 'line-inner',
                });

                // Enveloppement de chaque ligne dans un masque overflow: hidden strict
                split.lines.forEach((line) => {
                    const mask = document.createElement('div');
                    mask.className = 'line-mask';
                    line.parentNode.insertBefore(mask, line);
                    mask.appendChild(line);
                    allLines.push(line);
                });
            } else {
                // Fallback direct
                const mask = document.createElement('div');
                mask.className = 'line-mask';
                const inner = document.createElement('div');
                inner.className = 'line-inner';
                inner.innerHTML = target.innerHTML;
                target.innerHTML = '';
                mask.appendChild(inner);
                target.appendChild(mask);
                allLines.push(inner);
            }
        });

        if (allLines.length) {
            gsap.fromTo(allLines,
                {
                    yPercent: 115,
                },
                {
                    yPercent: 0,
                    duration: 0.85,
                    stagger: 0.08,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 76%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );
        }
    });
}

/**
 * 2. Révélations synchronisées des cartes de projets
 * - Images façon Loader : ouverture de masque polygone central + dézoom interne
 * - Chiffres card-num : glissement en yPercent
 * - Titres card-title : animation des lignes nette et droite (sans découpage par lettre pour éviter les lettres tordues)
 * - Synchronisation globale stagger avec déclenchement "pas trop tôt" (top 76%)
 */
function initCardReveals() {
    const cards = document.querySelectorAll('.projets-card');

    cards.forEach((card) => {
        const link = card.querySelector('.projets-card-link');
        const img = card.querySelector('.projets-card-img');
        const num = card.querySelector('.projets-card-num');
        const title = card.querySelector('.projets-card-title');
        const spans = title ? title.querySelectorAll('span') : [];

        // Timeline synchronisée pour chaque carte ("pas trop tôt", commence à 76% du viewport)
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: card,
                start: 'top 76%',
                toggleActions: 'play none none none',
            },
        });

        // 1. Apparition de l'image façon Loader
        // Le conteneur s'ouvre depuis le centre et l'image interne dézoome de 1.25 à 1
        if (link && img) {
            tl.fromTo(link,
                {
                    clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
                    opacity: 0,
                },
                {
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                    opacity: 1,
                    duration: 1.15,
                    ease: 'power3.out',
                    clearProps: 'clipPath',
                },
                0
            );

            tl.fromTo(img,
                {
                    scale: 1.35,
                },
                {
                    scale: 1.15,
                    duration: 1.15,
                    ease: 'power3.out',
                },
                0
            );
        }

        // 2. Chiffre en yPercent montant dans son masque
        if (num) {
            tl.fromTo(num,
                {
                    yPercent: 100,
                    opacity: 0,
                },
                {
                    yPercent: 0,
                    opacity: 1,
                    duration: 0.9,
                    ease: 'power3.out',
                },
                0.12
            );
        }

        // 3. Titre : animation des lignes en translation X et floutage doux
        // Utilise clearProps pour garantir que le texte redevient 100% net et parfaitement droit
        if (spans.length) {
            tl.fromTo(spans,
                {
                    x: -22,
                    opacity: 0,
                    filter: 'blur(6px)',
                },
                {
                    x: 0,
                    opacity: 1,
                    filter: 'blur(0px)',
                    duration: 0.75,
                    stagger: 0.08,
                    ease: 'power2.out',
                    clearProps: 'transform,filter', // Restaure le rendu typographique natif sans sous-pixelisation
                },
                0.2
            );
        }
    });
}

/**
 * 4. Parallaxe intra-image appliquée à img (permet à base-image--parallax de faire son scale(1.1) en hover sans conflit)
 */
function initCardImageParallax() {
    const images = document.querySelectorAll('.projets-card-img');

    images.forEach((img) => {
        gsap.fromTo(img,
            { yPercent: -5 },
            {
                yPercent: 5,
                ease: 'none',
                scrollTrigger: {
                    trigger: img.closest('.projets-card'),
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.6,
                },
            }
        );
    });
}

/**
 * 5. Parallaxe différentiel par colonne
 */
function initColumnParallax() {
    if (window.innerWidth <= 1100) return;

    const col2Items = document.querySelectorAll('.projets-list > [data-col="2"]');
    const col4Items = document.querySelectorAll('.projets-list > [data-col="4"]');

    [...col2Items, ...col4Items].forEach((item) => {
        gsap.fromTo(item,
            { y: 35 },
            {
                y: -35,
                ease: 'none',
                scrollTrigger: {
                    trigger: item,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.8,
                },
            }
        );
    });
}

/**
 * 6. Hover ultra-smooth façon Amine Zegmou (piloté par GSAP)
 * - figure : clipPath de inset(0%) à inset(4%)
 * - base-image--parallax : scale de 1 à 1.1 (transformOrigin: 50% 50%)
 * Fluidité maximale avec inertie continue et amorti soyeux power3.out
 */
function initCardHoverSmooth() {
    if (window.matchMedia('(hover: none)').matches) return;

    const cards = document.querySelectorAll('.projets-card');

    cards.forEach((card) => {
        const fig = card.querySelector('.projets-card-fig');
        const inner = card.querySelector('.base-image--parallax');
        if (!fig || !inner) return;

        gsap.set(fig, { clipPath: 'inset(0%)' });
        gsap.set(inner, { transformOrigin: '50% 50%', scale: 1 });

        card.addEventListener('mouseenter', () => {
            gsap.to(fig, {
                clipPath: 'inset(4%)',
                duration: 0.85,
                ease: 'power3.out',
                overwrite: 'auto',
            });
            gsap.to(inner, {
                scale: 1.1,
                duration: 0.85,
                ease: 'power3.out',
                overwrite: 'auto',
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(fig, {
                clipPath: 'inset(0%)',
                duration: 1.05,
                ease: 'power3.out',
                overwrite: 'auto',
            });
            gsap.to(inner, {
                scale: 1,
                duration: 1.05,
                ease: 'power3.out',
                overwrite: 'auto',
            });
        });
    });
}

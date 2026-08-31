/**
 * scroll.js — Dark Fantasy Scroll Animations
 * Parallax layers, section embers, fog depth
 */

export function initScrollAnimations() {
    // ── Hero Background Parallax ──
    const heroBg = document.querySelector('.hero-bg-image');
    if (heroBg) {
        gsap.to(heroBg, {
            yPercent: 20,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true,
            }
        });
    }

    // ── Hero Content Parallax (title moves up faster) ──
    const heroContent = document.querySelector('.souls-menu-content');
    if (heroContent) {
        gsap.to(heroContent, {
            yPercent: -30,
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: '70% top',
                scrub: true,
            }
        });
    }

    // ── Scroll indicator fades out ──
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        gsap.to(scrollIndicator, {
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: '20% top',
                scrub: true,
            }
        });
    }

    // ── Hero Fog layers parallax (different speeds) ──
    document.querySelectorAll('.hero .fog-layer').forEach((fog, i) => {
        gsap.to(fog, {
            yPercent: -(10 + i * 5),
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true,
            }
        });
    });

    // ── Section Chronicle fog parallax ──
    const chronicleFogs = document.querySelectorAll('.chronicle-fog');
    chronicleFogs.forEach((fog, i) => {
        gsap.fromTo(fog,
            { yPercent: 10 + i * 5 },
            {
                yPercent: -(10 + i * 5),
                ease: 'none',
                scrollTrigger: {
                    trigger: '.section-chronicle',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                }
            }
        );
    });

    // ── Section Forge glow parallax ──
    const forgeGlow = document.querySelector('.forge-glow');
    if (forgeGlow) {
        gsap.fromTo(forgeGlow,
            { yPercent: 20 },
            {
                yPercent: -10,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.section-forge',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                }
            }
        );
    }

    // ── Create section embers on scroll into view ──
    document.querySelectorAll('.section-embers').forEach(container => {
        const section = container.closest('section');
        if (!section) return;

        let embersCreated = false;

        ScrollTrigger.create({
            trigger: section,
            start: 'top 80%',
            onEnter: () => {
                if (!embersCreated) {
                    createSectionEmbers(container);
                    embersCreated = true;
                }
            }
        });
    });
}

/**
 * Create floating embers for a section
 */
function createSectionEmbers(container) {
    for (let i = 0; i < 20; i++) {
        const ember = document.createElement('div');
        const size = Math.random() * 2 + 1;
        const isGold = Math.random() > 0.5;
        const color = isGold ? '#c9a84c' : '#ff6b35';

        ember.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            bottom: 0;
            opacity: 0;
            pointer-events: none;
            box-shadow: 0 0 ${size * 2}px ${color};
        `;
        container.appendChild(ember);

        // Infinite float animation
        function floatEmber() {
            gsap.fromTo(ember,
                {
                    y: 0,
                    x: 0,
                    opacity: 0,
                    left: `${Math.random() * 100}%`,
                },
                {
                    y: -(container.offsetHeight * 0.8 + Math.random() * 200),
                    x: (Math.random() - 0.5) * 200,
                    opacity: Math.random() * 0.4 + 0.1,
                    duration: Math.random() * 8 + 6,
                    delay: Math.random() * 4,
                    ease: 'none',
                    onComplete: floatEmber,
                }
            );
        }
        floatEmber();
    }
}

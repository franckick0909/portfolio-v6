/**
 * main.js — Dark Fantasy Portfolio — Point d'entrée principal
 * GSAP, CustomEase, ScrollTrigger et Lenis chargés via CDN
 */
import { initLoader } from './components/loader.js';
import { initScrollAnimations } from './components/scroll.js';
import { initHero } from './components/hero.js';
import { initAbout } from './components/about.js';
import { initProjects } from './components/projects.js';
import { initDragons } from './components/dragons.js';

/* ── GSAP Plugins ── */
gsap.registerPlugin(CustomEase, ScrollTrigger);
CustomEase.create('hop', '0.8, 0, 0.2, 1');
CustomEase.create('hop2', '0.9, 0, 0.1, 1');
CustomEase.create('souls-ease', '0.25, 0.1, 0.25, 1');
CustomEase.create('souls-out', '0.16, 1, 0.3, 1');

/* ── Smooth Scroll (Lenis) ── */
const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.15,
    touchMultiplier: 1.5,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

/* ── Vanilla splitChars ── */
export function splitChars(selector) {
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

/* ── Init Everything ── */
document.addEventListener('DOMContentLoaded', () => {
    // Set initial states for hero elements (before loader reveals them)
    gsap.set('.souls-title', { opacity: 0, y: 30 });
    gsap.set('.title-horizon-line', { opacity: 0, scaleX: 0 });
    gsap.set('.souls-link', { opacity: 0, yPercent: 105 });
    gsap.set('.scroll-indicator', { opacity: 0 });
    gsap.set('.hero-side, .hero-copyright', { opacity: 0 });
    gsap.set('.header-logo', { opacity: 0, y: -20, autoAlpha: 0 });
    gsap.set('.header-nav', { opacity: 0, y: -20, autoAlpha: 0 });

    // Init modules
    initLoader();
    initHero();
    initScrollAnimations();
    initAbout();
    initProjects();
    initDragons();

    // Init text roll hover effect (Awwwards clone roll)
    initTextRollHover();

    // Init souls nav hover effects & incandescent trait indicator
    initSoulsNavInteraction();

    // Init nav scroll behavior ONLY once the hero entrance animation finishes
    let scrollInitialized = false;
    function startScrollTransition() {
        if (scrollInitialized) return;
        scrollInitialized = true;
        initNavScrollTransition();
    }

    window.addEventListener('heroRevealed', startScrollTransition);
    // Fallback safety timeout
    setTimeout(startScrollTransition, 7500);
});

/* ══════════════════════════════════════════════════
   TEXT ROLL HOVER EFFECT (Awwwards Style avec Clone & Stagger)
   ══════════════════════════════════════════════════ */
function initTextRollHover() {
    const rollElements = document.querySelectorAll('.roll-text');

    rollElements.forEach((el) => {
        const text = el.getAttribute('data-text') || el.textContent.trim();
        el.innerHTML = '';

        // Ligne principale
        const primaryLine = document.createElement('span');
        primaryLine.className = 'roll-line roll-line--primary';

        // Ligne clone
        const cloneLine = document.createElement('span');
        cloneLine.className = 'roll-line roll-line--clone';
        cloneLine.setAttribute('aria-hidden', 'true');

        // Découpage lettre par lettre
        Array.from(text).forEach((char) => {
            const span1 = document.createElement('span');
            span1.className = 'roll-char';
            span1.innerHTML = char === ' ' ? '&nbsp;' : char;
            primaryLine.appendChild(span1);

            const span2 = document.createElement('span');
            span2.className = 'roll-char';
            span2.innerHTML = char === ' ' ? '&nbsp;' : char;
            cloneLine.appendChild(span2);
        });

        el.appendChild(primaryLine);
        el.appendChild(cloneLine);

        // Positionnement initial du clone en dessous
        gsap.set(cloneLine.children, { yPercent: 100 });

        const parentLink = el.closest('.souls-link');
        if (!parentLink) return;

        parentLink.addEventListener('mouseenter', () => {
            gsap.to(primaryLine.children, {
                yPercent: -100,
                duration: 0.38,
                stagger: 0.016,
                ease: 'power3.out',
                overwrite: 'auto',
            });
            gsap.to(cloneLine.children, {
                yPercent: 0,
                duration: 0.38,
                stagger: 0.016,
                ease: 'power3.out',
                overwrite: 'auto',
            });
        });

        parentLink.addEventListener('mouseleave', () => {
            gsap.to(primaryLine.children, {
                yPercent: 0,
                duration: 0.32,
                stagger: 0.012,
                ease: 'power2.out',
                overwrite: 'auto',
            });
            gsap.to(cloneLine.children, {
                yPercent: 100,
                duration: 0.32,
                stagger: 0.012,
                ease: 'power2.out',
                overwrite: 'auto',
            });
        });
    });
}

/* ══════════════════════════════════════════════════
   NAV SCROLL TRANSITION (Scroll-driven)
   - Gros titre devient logo fixe au milieu haut
   - Liens centraux sortent avec yPercent
   - Réapparaissent en haut à droite en plus petit
   - Le reste s'efface/revient avec yPercent
   ══════════════════════════════════════════════════ */
function initNavScrollTransition() {
    const hero = document.querySelector('.hero');
    const titleWrap = document.querySelector('.souls-title-wrap');
    const heroLinks = document.querySelectorAll('.souls-link');
    const sideMarkers = document.querySelectorAll('.hero-side, .hero-copyright');
    const scrollInd = document.querySelector('.scroll-indicator');

    if (!hero) return;

    // 1. Le gros titre ARTORIAS rétrécit et monte vers le haut
    if (titleWrap) {
        gsap.fromTo(titleWrap,
            { scale: 1, yPercent: 0, opacity: 1 },
            {
                scale: 0.35,
                yPercent: -45,
                opacity: 0,
                ease: 'none',
                scrollTrigger: {
                    trigger: hero,
                    start: 'top top',
                    end: '50% top',
                    scrub: true,
                }
            }
        );
    }

    // 2. Le logo du header s'ancre au centre supérieur de l'écran
    gsap.fromTo('.header-logo',
        { opacity: 0, y: -20, autoAlpha: 0 },
        {
            opacity: 1,
            y: 0,
            autoAlpha: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: hero,
                start: '30% top',
                end: '55% top',
                scrub: true,
            }
        }
    );

    // 3. Les liens du menu du Hero disparaissent vers le haut dans leur masque avec yPercent
    if (heroLinks.length) {
        gsap.fromTo(heroLinks,
            { yPercent: 0, opacity: 1 },
            {
                yPercent: -105,
                opacity: 0,
                stagger: 0.03,
                ease: 'none',
                scrollTrigger: {
                    trigger: hero,
                    start: 'top top',
                    end: '42% top',
                    scrub: true,
                }
            }
        );
    }

    // 4. Les liens réapparaissent en haut à droite de l'écran en plus petit
    gsap.fromTo('.header-nav',
        { opacity: 0, y: -25, autoAlpha: 0 },
        {
            opacity: 1,
            y: 0,
            autoAlpha: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: hero,
                start: '35% top',
                end: '60% top',
                scrub: true,
            }
        }
    );

    // 5. Éléments secondaires (hero-side & copyright) s'effacent avec yPercent
    if (sideMarkers.length) {
        gsap.fromTo(sideMarkers,
            { opacity: 1, yPercent: 0 },
            {
                opacity: 0,
                yPercent: -60,
                ease: 'none',
                scrollTrigger: {
                    trigger: hero,
                    start: 'top top',
                    end: '30% top',
                    scrub: true,
                }
            }
        );
    }

    // 6. Indicateur de scroll s'efface avec yPercent
    if (scrollInd) {
        gsap.fromTo(scrollInd,
            { opacity: 0.75, yPercent: 0 },
            {
                opacity: 0,
                yPercent: -60,
                ease: 'none',
                scrollTrigger: {
                    trigger: hero,
                    start: 'top top',
                    end: '30% top',
                    scrub: true,
                }
            }
        );
    }
}

/* ══════════════════════════════════════════════════
   SOULS NAV INTERACTION (Keyboard + Synchronisation Header)
   Lien actif identifié par l'épée Dark Souls et le trait lumineux
   ══════════════════════════════════════════════════ */
function initSoulsNavInteraction() {
    const heroLinks = document.querySelectorAll('.souls-link');
    const headerLinks = document.querySelectorAll('.header-nav-link');
    let activeIndex = 0;

    // Définir le premier lien actif par défaut
    updateActive(0);

    // Survol souris sur les liens du Hero
    heroLinks.forEach((link, i) => {
        link.addEventListener('mouseenter', () => {
            updateActive(i);
        });
    });

    // Survol souris sur les liens du Header haut-droit
    headerLinks.forEach((link, i) => {
        link.addEventListener('mouseenter', () => {
            updateActive(i);
        });
    });

    // Navigation clavier (Flèches Haut/Bas)
    document.addEventListener('keydown', (e) => {
        const hero = document.querySelector('.hero');
        const heroRect = hero ? hero.getBoundingClientRect() : null;
        if (heroRect && heroRect.bottom < 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = Math.min(activeIndex + 1, heroLinks.length - 1);
            updateActive(activeIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = Math.max(activeIndex - 1, 0);
            updateActive(activeIndex);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            heroLinks[activeIndex]?.click();
        }
    });

    function updateActive(index) {
        heroLinks.forEach((link, i) => {
            link.classList.toggle('active', i === index);
        });
        headerLinks.forEach((link, i) => {
            link.classList.toggle('active', i === index);
        });
        activeIndex = index;
    }
}

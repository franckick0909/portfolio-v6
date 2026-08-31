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
    gsap.set('.souls-link', { opacity: 0, filter: 'blur(8px)' });
    gsap.set('.scroll-indicator', { opacity: 0 });
    gsap.set('.hero-side, .hero-copyright', { opacity: 0 });
    gsap.set('.main-nav', { opacity: 0, yPercent: -100 });

    // Init modules
    initLoader();
    initHero();
    initScrollAnimations();
    initAbout();
    initProjects();
    initDragons();

    // Init nav scroll behavior
    initNavScrollTransition();

    // Init souls nav hover effects
    initSoulsNavInteraction();
});

/* ══════════════════════════════════════════════════
   NAV SCROLL TRANSITION (Scroll-driven)
   Estompe le Hero à la descente et le restaure à la remontée (fromTo)
   ══════════════════════════════════════════════════ */
function initNavScrollTransition() {
    const content = document.querySelector('.souls-menu-content');
    const hero = document.querySelector('.hero');
    const sideMarkers = document.querySelectorAll('.hero-side, .hero-copyright');
    const scrollInd = document.querySelector('.scroll-indicator');

    if (!content || !hero) return;

    // Fondu et translation vers le haut du menu centré au scroll
    gsap.fromTo(content,
        { yPercent: 0, opacity: 1 },
        {
            yPercent: -25,
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: '65% top',
                scrub: true,
            }
        }
    );

    // Fondu des éléments latéraux (réapparaissent toujours à 100% à la remontée)
    if (sideMarkers.length) {
        gsap.fromTo(sideMarkers,
            { opacity: 1, y: 0 },
            {
                opacity: 0,
                y: -15,
                ease: 'none',
                scrollTrigger: {
                    trigger: hero,
                    start: 'top top',
                    end: '35% top',
                    scrub: true,
                }
            }
        );
    }

    // Fondu du scroll indicator (réapparaît toujours à 0.75 à la remontée)
    if (scrollInd) {
        gsap.fromTo(scrollInd,
            { opacity: 0.75, y: 0 },
            {
                opacity: 0,
                y: -15,
                ease: 'none',
                scrollTrigger: {
                    trigger: hero,
                    start: 'top top',
                    end: '35% top',
                    scrub: true,
                }
            }
        );
    }
}

/* ══════════════════════════════════════════════════
   SOULS NAV INTERACTION
   Keyboard navigation + hover effects on the hero menu
   ══════════════════════════════════════════════════ */
function initSoulsNavInteraction() {
    const links = document.querySelectorAll('.souls-link');
    let activeIndex = 0;

    // Set initial active
    updateActive(0);

    // Mouse hover
    links.forEach((link, i) => {
        link.addEventListener('mouseenter', () => {
            updateActive(i);
        });
    });

    // Keyboard navigation (arrows)
    document.addEventListener('keydown', (e) => {
        // Only when hero is in view
        const hero = document.querySelector('.hero');
        const heroRect = hero.getBoundingClientRect();
        if (heroRect.bottom < 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = Math.min(activeIndex + 1, links.length - 1);
            updateActive(activeIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = Math.max(activeIndex - 1, 0);
            updateActive(activeIndex);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            links[activeIndex].click();
        }
    });

    function updateActive(index) {
        links.forEach((link, i) => {
            if (i === index) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        activeIndex = index;
    }
}

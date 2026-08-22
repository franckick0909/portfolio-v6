/**
 * main.js — Point d'entrée principal
 * GSAP, CustomEase, ScrollTrigger et Lenis sont chargés via CDN (variables globales)
 */

import { initLoader } from './components/loader.js';
import { initAbout } from './components/about.js';

/* ── Enregistrement des plugins GSAP (gratuits) ── */
gsap.registerPlugin(CustomEase, ScrollTrigger);
CustomEase.create('hop',  '0.8, 0, 0.2, 1');
CustomEase.create('hop2', '0.9, 0, 0.1, 1');
CustomEase.create('menu', '0.24, 0.43, 0.15, 0.97');  // ease unifié pour tous les liens du menu

/* ── Eases extraits de Fame Estate ── */
CustomEase.create('fame-default', '0.24, 1, 0.36, 1');
CustomEase.create('fame-in-out-quint', '0.83, 0, 0.17, 1');
CustomEase.create('fame-out-quint', '0.22, 1, 0.26, 1');
CustomEase.create('fame-out-expo', '0.16, 1, 0.3, 1');
CustomEase.create('fame-essai', '0.25, 0.1, 0.25, 1');


/* ── Smooth scroll Lenis — connecté au ticker GSAP ── */
const lenis = new Lenis({
    duration: 1.5,
    lerp: 0.1,
    syncTouch: true,
    touchMultiplier: 2,
});

// Connexion Lenis → ScrollTrigger (obligatoire pour que pin/scrub fonctionnent)
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);


/* ── Vanilla splitChars (même pattern mask que le loader) ── */
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

/* ── Init loader + about ── */
document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initAbout();
});

/* ── Menu open/close ── */
document.addEventListener('DOMContentLoaded', () => {
    const container    = document.querySelector('.container');
    const menuToggle   = document.querySelector('.menu-toggle');
    const menuOverlay  = document.querySelector('.menu-overlay');
    const menuContent  = document.querySelector('.menu-content');
    const menuPreviewImg = document.querySelector('.menu-preview-img');
    const menuLinks    = document.querySelectorAll('.link a');

    let isOpen = false;
    let isAnimating = false;

    /* ── Split des gros liens en chars (même pattern que le titre loader) ── */
    splitChars('.link a');
    gsap.set('.link .char', { yPercent: 115 });   // masqués vers le bas
    gsap.set('.social a',   { yPercent: 115, opacity: 0 });
    gsap.set('.menu-footer-links a', { yPercent: 115, opacity: 0 });
    gsap.set('.menu-links .link-icon', { width: 0, marginRight: 0 });
    /* flèche ↗ Elementis, positionnée en diagonale bas-gauche = masquée par overflow:hidden */
    gsap.set('.menu-links .link-icon img', { x: -20, y: 20 });

    /* ── Hover icon : flèche ↗ entre en diagonale depuis le bas ──
     * Translation x:-20,y:20 → x:0,y:0
     * = déplacement dans le sens de la queue de la flèche (bas-gauche) vers sa tête.
     * overflow:hidden sur .link-icon fait le clipping, sans clip-path. */
    document.querySelectorAll('.link').forEach(linkDiv => {
        const icon    = linkDiv.querySelector('.link-icon');
        const iconImg = icon ? icon.querySelector('img') : null;
        if (!icon || !iconImg) return;

        linkDiv.addEventListener('mouseenter', () => {
            if (!isOpen) return;
            gsap.killTweensOf([icon, iconImg]);   // annule tout tween en cours (hover rapide)
            gsap.to(icon,    { width: '1.4em', marginRight: '1.4rem', duration: 0.4,  ease: 'menu' });
            gsap.to(iconImg, { x: 0, y: 0,                          duration: 0.45, ease: 'menu' });
        });
        linkDiv.addEventListener('mouseleave', () => {
            if (!isOpen) return;
            gsap.killTweensOf([icon, iconImg]);   // annule tout tween en cours (hover rapide)
            gsap.to(iconImg, { x: -21, y: 21, duration: 0.25, ease: 'menu' });
            gsap.to(icon,    { width: 0, marginRight: 0, duration: 0.28, ease: 'menu' });
        });
    });

    /* ─────────────────────────────────────────────────── */

    menuToggle.addEventListener('click', () => {
        if (!isOpen) openMenu();
        else closeMenu();
    });

    /* ── Texte du toggle ── */
    function animateMenuToggle(isOpening) {
        const open  = document.querySelector('p#menu-open');
        const close = document.querySelector('p#menu-close');

        gsap.to(isOpening ? open : close, {
            x: isOpening ? -5 : 5,
            y: isOpening ? 10 : -10,
            rotate: isOpening ? -5 : 5,
            opacity: 0,
            duration: 0.5,
            ease: 'hop2',
        });
        gsap.to(isOpening ? close : open, {
            x: 0, y: 0, rotate: 0, opacity: 1,
            delay: 0.5,
            duration: 0.5,
            ease: 'hop2',
        });
    }

    /* ── Preview images ── */
    function cleanupPreviewImages() {
        const imgs = menuPreviewImg.querySelectorAll('img');
        if (imgs.length > 5) {
            for (let i = 0; i < imgs.length - 5; i++) {
                menuPreviewImg.removeChild(imgs[i]);
            }
        }
    }

    function resetPreviewImages() {
        menuPreviewImg.innerHTML = '';
        const defaultImg = document.createElement('img');
        defaultImg.src = 'assets/images/loader/img1.jpg';
        menuPreviewImg.appendChild(defaultImg);
    }

    /* ── OPEN ── */
    function openMenu() {
        if (isAnimating || isOpen) return;
        isAnimating = true;

        resetPreviewImages();

        /* Hero se décale */
        gsap.to(container, {
            rotate: 10, x: 300, y: 450, scale: 1.5,
            duration: 1.25,
            ease: 'hop',
        });

        animateMenuToggle(true);

        /* Overlay : wipe depuis le haut */
        gsap.to(menuOverlay, {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            duration: 1,
            ease: 'hop',
            onComplete: () => {
                isOpen = true;
                isAnimating = false;
            },
        });

        /* Contenu du menu entre en scène — rotation: 0 force le reset de tout état GSAP résiduel */
        gsap.to(menuContent, {
            x: 0, rotation: 0, scale: 1, opacity: 1,
            duration: 1,
            ease: 'hop',
        });

        /* Panel image : wipe depuis le bas + rotation/scale pour l'effet 3D */
        gsap.to(menuPreviewImg, {
            clipPath: 'inset(0% 0% 0% 0%)',
            rotation: 0,
            scale: 1,
            duration: 1,
            delay: 0.15,
            ease: 'hop',
        });

        /* Gros liens : chars remontent depuis le bas */
        gsap.to('.link .char', {
            yPercent: 0,
            duration: 0.9,
            ease: 'menu',
            delay: 0.35,
            stagger: { each: 0.02, from: 'random' },
        });

        /* Liens sociaux + footer */
        gsap.to(['.social a', '.menu-footer-links a'], {
            yPercent: 0,
            opacity: 1,
            duration: 0.75,
            ease: 'menu',
            delay: 0.55,
            stagger: 0.06,
        });
    }

    /* ── CLOSE ── */
    function closeMenu() {
        if (isAnimating || !isOpen) return;
        isAnimating = true;

        /* Liens sociaux + footer sortent vers le haut */
        gsap.to(['.social a', '.menu-footer-links a'], {
            yPercent: -115,
            opacity: 0,
            duration: 0.4,
            ease: 'menu',
            stagger: { each: 0.05, from: 'end' },
        });

        /* Gros liens : chars sortent vers le haut */
        gsap.to('.link .char', {
            yPercent: -115,
            duration: 0.4,
            ease: 'menu',
            delay: 0.1,
            stagger: { each: 0.015, from: 'random' },
        });

        animateMenuToggle(false);

        /* Panel image sort vers le haut et reprend sa rotation/scale */
        gsap.to(menuPreviewImg, {
            clipPath: 'inset(100% 0% 0% 0%)',
            rotation: -3,
            scale: 1.1,
            duration: 0.6,
            ease: 'hop',
        });

        /* Contenu du menu reprend sa position initiale (incluant rotation) */
        gsap.to(menuContent, {
            x: -80, rotation: -2, scale: 1.04, opacity: 0,
            duration: 1,
            delay: 0.25,
            ease: 'hop',
        });

        /* Hero reprend sa place */
        gsap.to(container, {
            rotate: 0, x: 0, y: 0, scale: 1,
            duration: 1.25,
            delay: 0.25,
            ease: 'hop',
        });

        /* Overlay : wipe vers le haut */
        gsap.to(menuOverlay, {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
            duration: 1,
            delay: 0.35,
            ease: 'hop',
            onComplete: () => {
                isOpen = false;
                isAnimating = false;
                /* Reset des états initiaux pour la prochaine ouverture */
                gsap.set('.link .char', { yPercent: 115 });
                gsap.set('.social a',   { yPercent: 115, opacity: 0 });
                gsap.set('.menu-footer-links a', { yPercent: 115, opacity: 0 });
                gsap.set('.menu-links .link-icon', { width: 0, marginRight: 0 });
                gsap.set('.menu-links .link-icon img', { x: -20, y: 20 });
                gsap.set(menuPreviewImg, { clipPath: 'inset(100% 0% 0% 0%)', rotation: -3, scale: 1.1 });
            },
        });
    }

    /* ── Hover : changement d'image avec wipe inset (style Elementis) ── */
    menuLinks.forEach(link => {
        link.addEventListener('mouseover', () => {
            if (!isOpen || isAnimating) return;

            const imgSrc = link.getAttribute('data-img');
            if (!imgSrc) return;

            const currentImgs = menuPreviewImg.querySelectorAll('img');
            const lastImg = currentImgs[currentImgs.length - 1];

            if (lastImg && lastImg.src.endsWith(imgSrc)) return;

            const newImg = document.createElement('img');
            newImg.src = imgSrc;
            menuPreviewImg.appendChild(newImg);

            /* BOTTOM → TOP : même direction que le loader
             * inset(100% top) = tout clippé depuis le haut = rien de visible
             * inset(0%) = tout visible = le bas s'est révélé en premier */
            gsap.set(newImg, {
                scale: 1.15,
                clipPath: 'inset(100% 0% 0% 0%)',
            });

            /* ── Style Elementis : l'ancienne image RESTE en place ──
             * La nouvelle image monte par le bas et la COUVRE progressivement.
             * Quand on passe vite sur les liens → effet de bandes empilées. */
            const allImgs = menuPreviewImg.querySelectorAll('img');
            if (allImgs.length > 4) {
                allImgs[0].remove();   // supprimer silencieusement la plus ancienne
            }

            /* ── Effet "projection" : clip-path + scale en parallèle ──
             * Le clip-path et le scale se terminent exactement au même moment.
             * Scale : 1.15 → 1.22 (overshoot) → 1.0 sur 0.7s total
             * Clip  :        wipe depuis le bas         sur 0.7s total */
            const imgTl = gsap.timeline();
            imgTl
                /* Clip-path : wipe complet sur toute la durée */
                .to(newImg, {
                    clipPath: 'inset(0% 0% 0% 0%)',
                    duration: 0.7,
                    ease: 'power2.out',
                }, 0)
                /* Scale : monte vers 1.22 (0 → 0.35s) */
                .to(newImg, {
                    scale: 1.01,
                    duration: 0.35,
                    ease: 'power2.out',
                }, 0)
                /* Scale : revient à 1 (0.35s → 0.70s) — fini en même temps que le clip */
                .to(newImg, {
                    scale: 1,
                    duration: 1,
                    ease: 'power2.inOut',
                }, 0.35);
        });
    });
});

/* ── Init Sections ── */
document.addEventListener('DOMContentLoaded', () => {
    initAbout();
});

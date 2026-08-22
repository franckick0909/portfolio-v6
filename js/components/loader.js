/**
 * loader.js — Animation du preloader
 * GSAP, CustomEase, ScrollTrigger chargés via CDN (variables globales)
 */

/* ── Vanilla SplitText avec mask : chaque lettre dans son propre overflow:hidden ── */
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

/* ── Vanilla SplitText words : chaque mot dans son propre overflow:hidden ── */
function splitWords(selector) {
    const els = document.querySelectorAll(selector);
    els.forEach(el => {
        const words = el.textContent.trim().split(/\s+/);
        el.textContent = '';
        words.forEach((word, i) => {
            const mask = document.createElement('span');
            mask.className = 'word-mask';
            const span = document.createElement('span');
            span.className = 'word';
            span.textContent = word;
            mask.appendChild(span);
            el.appendChild(mask);
            /* espace entre les mots (sauf après le dernier) */
            if (i < words.length - 1) el.appendChild(document.createTextNode('\u00A0'));
        });
    });
}

export function initLoader() {
    console.log('⏳ Loader initialisé');

    /* ── Split des deux titres en chars ── */
    splitChars('.preloader-header h1');
    splitChars('.header h1');

    /* ── Split des liens nav et textes footer en words ── */
    splitWords('nav a');
    splitWords('.hero-footer p');

    /* ── État initial des images ── */
    const preloaderImgInitRotations = [7.5, -2.5, -10, 12.5, -5, 5];

    gsap.set('.preloader-img', {
        xPercent: -50,
        yPercent: -50,
        scale: 1.3,
        rotation: (i) => preloaderImgInitRotations[i],
        clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
    });

    /* Chars du preloader : masqués vers le bas */
    gsap.set('.preloader-header .char', { yPercent: 115 });

    /* Chars du hero : masqués vers le bas (animés après la fermeture du preloader) */
    gsap.set('.header .char', { yPercent: 115 });

    /* Words nav + footer : masqués vers le bas */
    gsap.set('.word', { yPercent: 115 });

    /* Counter : masqué vers le bas */
    gsap.set('.preloader-counter p', { yPercent: 100 });

    /* ── Timeline principale ── */
    const tl = gsap.timeline({ delay: 0.5 });

    /* ① Images : wipe depuis le bas + zoom-out + rotation qui se résorbe */
    tl.to('.preloader-img', {
        scale: 1,
        rotation: 0,
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        duration: 1.2,
        ease: 'hop',
        stagger: 0.15,
    });

    /* ② Titre preloader : chaque lettre remonte depuis le bas */
    tl.to('.preloader-header .char', {
        yPercent: 0,
        duration: 1,
        ease: 'hop2',
        stagger: { each: 0.125, from: 'random' },
    }, '0.35');

    /* ② Counter : slide in + comptage 000 → 100 */
    tl.to('.preloader-counter p', {
        yPercent: 0,
        duration: 1,
        ease: 'hop2',
        onStart: () => {
            const countEl = document.querySelector('.preloader-counter p');
            const counter = { value: 0 };
            gsap.to(counter, {
                value: 100,
                duration: 2,
                ease: 'power2.inOut',
                onUpdate: () => {
                    countEl.textContent = String(Math.round(counter.value)).padStart(3, '0');
                },
            });
        },
    }, '0.35');

    /* ③ EXIT — Counter sort vers le haut */
    tl.to('.preloader-counter p', {
        yPercent: -100,
        duration: 0.75,
        ease: 'hop2',
    }, 3.25);

    /* ③ EXIT — Titre preloader sort vers le haut */
    tl.to('.preloader-header .char', {
        yPercent: -100,
        duration: 0.75,
        ease: 'hop2',
        stagger: { each: 0.125, from: 'random' },
    }, '2');

    /* ③ EXIT — Images : wipe vers le haut + zoom-in (miroir de l'entrée) */
    tl.to('.preloader-img', {
        scale: 1.3,
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
        duration: 0.9,
        ease: 'hop',
        stagger: { each: 0.08, from: 'end' },
    }, '3.5');

    /* ④ Le preloader se referme vers le haut */
    tl.to('.preloader', {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
        duration: 1,
        ease: 'hop2',
    }, '4.35');

    /* ④ On masque le preloader une fois fermé */
    tl.set('.preloader', { display: 'none' });

    /* ④ Titre hero : chaque lettre entre depuis le bas (comme le preloader) */
    tl.to('.header .char', {
        yPercent: 0,
        duration: 1,
        ease: 'hop',
        stagger: { each: 0.075, from: 'random' },
    }, '4.35');

    tl.to('nav a .word', {
        yPercent: 0,
        duration: 1,
        ease: 'hop',
        stagger: 0.075,
    }, '4.75');

    tl.to('.hero-footer p .word', {
        yPercent: 0,
        duration: 1,
        ease: 'hop',
        stagger: 0.075,
    }, '4.75');



}

/**
 * app.js — Utilitaires partagés (si besoin futur)
 * GSAP, CustomEase, ScrollTrigger chargés via CDN (variables globales)
 * ⚠️ SplitText est un plugin payant GSAP Club — non utilisé ici
 */

/* ── Enregistrement des plugins GSAP (gratuits) ── */
gsap.registerPlugin(CustomEase, ScrollTrigger);
CustomEase.create('hop',  '0.8, 0, 0.2, 1');
CustomEase.create('hop2', '0.9, 0, 0.1, 1');
CustomEase.create('menu', '0.24, .43, .15, .97');

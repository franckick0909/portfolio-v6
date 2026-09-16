/**
 * loader.js — Artorias Horizontal Split Preloader (Awwwards-Class)
 *
 * Sequence:
 * 1. Brand Title "ARTORIAS" + Subtitle discover in yPercent with line masks (t = 0.4s)
 * 2. Left Story lines discover line by line in yPercent with masks (t = 1.3s)
 * 3. Right Story lines discover line by line in yPercent with masks (t = 3.4s)
 * 4. Dragon runner & center track appear at origin left (t = 5.8s)
 * 5. Progress-Bar Stage 1:
 *    - scaleX: 30%, duration: 2s, ease: "power4.inOut", delay: 7s
 *    - Dragon travels to 30%, Counter rolls to 30%
 * 6. Progress-Bar Stage 2:
 *    - scaleX: 100%, duration: 2s, ease: "power3.out", delay: 8.5s
 *    - Dragon travels to 100%, Counter rolls to 100%
 * 7. Trait & Dragon exit in xPercent: 100 to the right (t = 10.65s)
 * 8. Texts exit downward in yPercent (t = 11.0s)
 * 9. Counter & Brand exit (t = 11.35s)
 * 10. Grand Horizontal Split (t = 11.65s)
 * 11. 3D Camera pullback & soft amber Lantern ignition flash (t = 11.8s)
 */

/* ── Preloader Floating Embers ── */
function createPreloaderEmbers() {
  const container = document.querySelector(".preloader-embers");
  if (!container) return;
  container.innerHTML = "";

  const count = 18;
  for (let i = 0; i < count; i++) {
    const ember = document.createElement("div");
    const size = Math.random() * 1.8 + 0.8;
    ember.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle, #fff2cc 0%, #ff7b1a 60%, transparent 100%);
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      bottom: -10px;
      opacity: 0;
      pointer-events: none;
    `;
    container.appendChild(ember);

    gsap.to(ember, {
      y: -(window.innerHeight + 50),
      x: (Math.random() - 0.5) * 80,
      opacity: Math.random() * 0.45 + 0.15,
      duration: Math.random() * 4.5 + 3.5,
      delay: Math.random() * 2,
      repeat: -1,
      ease: "sine.inOut",
      onRepeat: () => {
        gsap.set(ember, {
          left: `${Math.random() * 100}%`,
          y: 0,
          opacity: 0,
        });
      },
    });
  }
}

export function initLoader() {
  const preloader           = document.getElementById("preloader");
  const panelTop            = document.getElementById("preloaderPanelTop");
  const panelBottom         = document.getElementById("preloaderPanelBottom");
  const centerAxis          = document.getElementById("preloaderCenterAxis");
  const splitLineTrack      = document.querySelector(".split-line-track");
  const splitLineFill       = document.getElementById("splitLineFill");
  const splitLineGlow       = document.getElementById("splitLineGlow");
  const splitSparkRunner    = document.getElementById("splitSparkRunner");
  const brandTitle          = document.querySelector(".preloader-brand-title");
  const brandSub            = document.querySelector(".preloader-brand-sub");


  const counterEl           = document.querySelector(".counter");
  const digit1              = document.querySelector(".digit-1");
  const digit2              = document.querySelector(".digit-2");
  const digit3              = document.querySelector(".digit-3");

  if (!preloader || !panelTop || !panelBottom) return;

  // Populate digit3 (units) with 10 full 0-9 cycles + final 0 (101 numbers total)
  if (digit3 && digit3.children.length <= 1) {
    digit3.innerHTML = "";
    for (let cycle = 0; cycle < 10; cycle++) {
      for (let j = 0; j < 10; j++) {
        const div = document.createElement("div");
        div.className = "num";
        div.textContent = j;
        digit3.appendChild(div);
      }
    }
    const finalDiv = document.createElement("div");
    finalDiv.className = "num";
    finalDiv.textContent = "0";
    digit3.appendChild(finalDiv);
  }

  // Populate digit2 (tens) with 0-9 + final 0 (11 numbers total)
  if (digit2 && digit2.children.length <= 1) {
    digit2.innerHTML = "";
    for (let j = 0; j < 10; j++) {
      const div = document.createElement("div");
      div.className = "num";
      div.textContent = j;
      digit2.appendChild(div);
    }
    const finalDiv = document.createElement("div");
    finalDiv.className = "num";
    finalDiv.textContent = "0";
    digit2.appendChild(finalDiv);
  }

  // Populate digit1 (hundreds) with 0 and 1
  if (digit1 && digit1.children.length <= 1) {
    digit1.innerHTML = '<div class="num">0</div><div class="num">1</div>';
  }

  /* ── Initial states ── */
  gsap.set([panelTop, panelBottom], { yPercent: 0 });

  // Texts and titles hidden beneath their individual line masks
  if (brandTitle)    gsap.set(brandTitle, { yPercent: 100, opacity: 1 });
  if (brandSub)      gsap.set(brandSub,   { yPercent: 100, opacity: 1 });

  // Progress line starts at 0 width (scaleX: 0) from left origin
  if (splitLineFill)  gsap.set(splitLineFill,  { scaleX: 0, xPercent: 0, transformOrigin: "left center" });
  if (splitLineGlow)  gsap.set(splitLineGlow,  { scaleX: 0, xPercent: 0, transformOrigin: "left center" });
  if (splitLineTrack) gsap.set(splitLineTrack, { opacity: 1 });
  if (centerAxis)     gsap.set(centerAxis,     { opacity: 1 });

  // Spark runner positioned at origin left
  if (splitSparkRunner) {
    gsap.set(splitSparkRunner, {
      x: 0,
      opacity: 0,
      scale: 0.85,
    });
  }

  // Counter initial state
  if (counterEl) gsap.set(counterEl, { opacity: 0, yPercent: 100 });
  if (digit1)    gsap.set(digit1, { y: 0 });
  if (digit2)    gsap.set(digit2, { y: 0 });
  if (digit3)    gsap.set(digit3, { y: 0 });

  /* Start subtle floating embers */
  createPreloaderEmbers();

  /* ── Master Timeline ── */
  const tl = gsap.timeline({ delay: 0.5 });
  window.preloaderTL = tl;

  /* ① t = 0.2s: Brand Title, Subtitle & Counter appear simultaneously */
  if (brandTitle) {
    tl.to(brandTitle, {
      yPercent: 0,
      duration: 0.8,
      ease: "power3.out",
    }, 0.2);
  }

  if (brandSub) {
    tl.to(brandSub, {
      yPercent: 0,
      duration: 0.7,
      ease: "power3.out",
    }, 0.3);
  }

  if (counterEl) {
    tl.to(counterEl, {
      opacity: 1,
      yPercent: 0,
      duration: 0.8,
      ease: "power2.out",
    }, 0.2);
  }

  if (splitSparkRunner) {
    tl.to(splitSparkRunner, {
      opacity: 1,
      scale: 1,
      duration: 0.7,
      ease: "power2.out",
    }, 0.2);
  }

  /* ② PROGRESS-BAR & COUNTER SYNCHRONIZED PHASES
       - Curve: "très très lente au début et finis rapide (jusqu'a 30% lent puis rapide)"
       - Phase 1: 0% -> 30%, slow curve (duration: 2.2s, ease: power2.in)
       - Phase 2: 30% -> 100%, fast curve (duration: 1.3s, ease: power2.out) */
  const progressState = { val: 0 };
  const getScreenWidth = () => window.innerWidth;
  const getNumHeight = () => {
    const sample = document.querySelector(".digit-mask .num");
    return sample && sample.getBoundingClientRect().height > 0 ? sample.getBoundingClientRect().height : 120;
  };

  function updateVisuals(v) {
    const clamped = Math.max(0, Math.min(100, v));
    const ratio = clamped / 100;
    const numH = getNumHeight();

    // Progress bar scaleX from origin left
    if (splitLineFill)  gsap.set(splitLineFill,  { scaleX: ratio, transformOrigin: "left center" });
    if (splitLineGlow)  gsap.set(splitLineGlow,  { scaleX: ratio, transformOrigin: "left center" });

    // Dragon runner tracks the head of the progress line
    if (splitSparkRunner) {
      gsap.set(splitSparkRunner, { x: ratio * getScreenWidth() });
    }

    // Units digit column (rolls 100 steps from 0 to 100)
    if (digit3) {
      gsap.set(digit3, { y: -clamped * numH });
    }

    // Tens digit column (rolls 10 steps from 0 to 10)
    if (digit2) {
      gsap.set(digit2, { y: -(clamped / 10) * numH });
    }

    // Hundreds digit column (rolls from 0 to 1 only between 90% and 100%)
    if (digit1) {
      const d1Target = clamped < 90 ? 0 : -((clamped - 90) / 10) * numH;
      gsap.set(digit1, { y: d1Target });
    }
  }

  // Initialize at 0
  updateVisuals(0);

  // Progress Bar Phase 1: starts at t = 0.8s, slow curve to 30%
  tl.to(progressState, {
    val: 30,
    duration: 2.2,
    ease: "power2.in",
    onUpdate: () => updateVisuals(progressState.val),
  }, 0.8);

  // Progress Bar Phase 2: from t = 3.0s, accelerates fast to 100%
  tl.to(progressState, {
    val: 100,
    duration: 1.3,
    ease: "power2.out",
    onUpdate: () => updateVisuals(progressState.val),
  }, 3.0);

  // Reaches 100% at t = 4.3s!
  // Brief hold (t = 4.3s to 4.55s) to guarantee the user sees the trait touch the right edge of the screen!
  const lineExitStart = 4.55;

  /* ③ DISPARITION DU TRAIT EN scaleX: 0 VERS RIGHT (APRÈS AVOIR TOUCHÉ LE BORD DROIT)
       & DISPARITION SIMULTANÉE DES TEXTES ET DU COMPTEUR */
  tl.add(() => {
    // Set origin to right center so it collapses into the right edge
    if (splitLineFill) gsap.set(splitLineFill, { transformOrigin: "right center" });
    if (splitLineGlow) gsap.set(splitLineGlow, { transformOrigin: "right center" });
  }, lineExitStart);

  if (splitLineFill && splitLineGlow) {
    tl.to([splitLineFill, splitLineGlow], {
      scaleX: 0,
      duration: 0.65,
      ease: "power3.in",
    }, lineExitStart);
  }

  if (splitSparkRunner) {
    tl.to(splitSparkRunner, {
      x: () => window.innerWidth + 250,
      opacity: 0,
      duration: 0.65,
      ease: "power3.in",
    }, lineExitStart);
  }

  if (splitLineTrack) {
    tl.to(splitLineTrack, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.in",
    }, lineExitStart + 0.1);
  }

  // Counter & Brand disparaissent
  if (counterEl) {
    tl.to(counterEl, {
      yPercent: 125,
      opacity: 0,
      duration: 0.5,
      ease: "power3.in",
    }, lineExitStart);
  }

  if (brandTitle && brandSub) {
    tl.to([brandTitle, brandSub], {
      yPercent: -125,
      opacity: 0,
      duration: 0.5,
      stagger: 0.05,
      ease: "power3.in",
    }, lineExitStart);
  }

  /* ④ GRAND SPLIT HORIZONTAL (t = 5.2s) */
  tl.to(panelTop, {
    yPercent: -100,
    duration: 1.3,
    ease: "power4.inOut",
  }, 5.2);

  tl.to(panelBottom, {
    yPercent: 100,
    duration: 1.3,
    ease: "power4.inOut",
  }, 5.2);

  /* ⑤ Trigger 3D Camera Pullback & Soft Amber Lantern Flare (t = 5.35s) */
  tl.add(() => {
    window.dispatchEvent(new CustomEvent("igniteHeroSanctuary"));
  }, 5.35);

  /* ⑥ Hero navigation entrance (t = 5.9s) */
  const heroRevealStart = 5.9;

  tl.to(".navbar", {
    opacity: 1,
    duration: 0.8,
    ease: "power2.out",
  }, heroRevealStart);

  tl.fromTo(".navbar .nav-link", {
    yPercent: 30,
    opacity: 0,
    filter: "blur(6px)",
  }, {
    yPercent: 0,
    opacity: 1,
    filter: "blur(0px)",
    duration: 1.0,
    stagger: 0.08,
    ease: "power3.out",
  }, heroRevealStart);

  tl.fromTo(".navbar-logo", {
    y: -10,
    opacity: 0,
    filter: "blur(6px)",
  }, {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    duration: 1.0,
    ease: "power3.out",
  }, heroRevealStart + 0.1);

  tl.fromTo(".hero-title-container", {
    yPercent: 15,
    opacity: 0,
    filter: "blur(12px)",
  }, {
    yPercent: 0,
    opacity: 1,
    filter: "blur(0px)",
    duration: 1.5,
    ease: "power3.out",
  }, heroRevealStart + 0.1);

  tl.to(".hero-side, .hero-copyright", {
    opacity: 1,
    duration: 1.0,
    ease: "power2.out",
  }, heroRevealStart + 0.2);

  tl.to(".scroll-indicator", {
    opacity: 0.75,
    duration: 0.8,
    ease: "power2.out",
  }, heroRevealStart + 0.3);

  /* ⑦ Complete & dispose preloader */
  tl.to(preloader, {
    opacity: 0,
    duration: 1.0,
    ease: "power2.inOut",
    onComplete: () => {
      preloader.style.display = "none";
      // Ensure Lenis smooth scroll and ScrollTrigger know the layout is active
      window.dispatchEvent(new Event("resize"));
      if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
    },
  }, heroRevealStart + 1.2);
}

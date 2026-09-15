/**
 * about.js — Section À Propos : La Traversée des Abysses
 *
 * Défilement horizontal cinématique scrubbé (GSAP ScrollTrigger).
 * Animations d'entrée dynamiques type "WhileInView" (Framer Motion style) :
 * - Révélation progressive des cadres (stèles) avec flou optique & montée subtile
 * - Cascade chorégraphiée (stagger) des titres, sous-titres, paragraphes et badges
 * - Remplissage fluide des jauges de statistiques (Stèle II)
 * - Révélation du Bonfire et des boutons d'action (Stèle IV)
 * - Simulation 60 FPS des Wisps d'humanité en Canvas 2D
 */

export function initAbout() {
  const section = document.querySelector(".section-a-propos");
  const track = document.querySelector(".abyss-track");
  const bgImg = document.querySelector(".abyss-bg-img");

  if (!section || !track || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    return;
  }

  // 1. Initialiser le Canvas des Wisps d'humanité flottantes
  initAbyssWisps(section);

  // 2. Défilement Horizontal scrubbé avec Pinning
  const getScrollAmount = () => {
    return -(track.scrollWidth - window.innerWidth + window.innerWidth * 0.08);
  };

  const horizontalTl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => `+=${track.scrollWidth * 1.15}`,
      pin: true,
      scrub: 1.0,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  // Déplacement du track horizontal
  horizontalTl.to(track, {
    x: getScrollAmount,
    ease: "none",
  }, 0);

  // Parallaxe lente sur le fond des Abysses pour effet d'immensité
  if (bgImg) {
    horizontalTl.to(bgImg, {
      xPercent: -18,
      ease: "none",
    }, 0);
  }

  // 3. Animations "WhileInView" style Framer Motion pour chaque stèle
  const steles = track.querySelectorAll(".abyss-stele");

  steles.forEach((stele, index) => {
    // Timeline dédiée à l'entrée de chaque stèle
    const steleTl = gsap.timeline({
      scrollTrigger: {
        trigger: stele,
        containerAnimation: horizontalTl,
        start: index === 0 ? "left 98%" : "left 85%",
        end: "right 20%",
        toggleActions: "play reverse play reverse",
      },
    });

    // A. Animation du cadre (Stèle) : montée douce, dézoom et défocalisation (unblur)
    steleTl.fromTo(
      stele,
      {
        opacity: 0,
        y: 45,
        scale: 0.94,
        filter: "blur(8px)",
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "power3.out",
      },
      0
    );

    // B. En-tête (Tag + Runes de chapitre)
    const header = stele.querySelector(".stele-header");
    if (header) {
      steleTl.fromTo(
        header,
        { opacity: 0, y: -15 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        0.15
      );
    }

    // C. Titre Monumental & Sous-titre
    const title = stele.querySelector(".stele-title");
    const subtitle = stele.querySelector(".stele-subtitle");
    if (title) {
      steleTl.fromTo(
        title,
        { opacity: 0, y: 30, letterSpacing: "0.14em" },
        { opacity: 1, y: 0, letterSpacing: "0.08em", duration: 0.7, ease: "power3.out" },
        0.2
      );
    }
    if (subtitle) {
      steleTl.fromTo(
        subtitle,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        0.3
      );
    }

    // D. Animations spécifiques selon la stèle
    // Stèle I : Origine (Paragraphes & Sceau tournant d'Artorias)
    if (stele.classList.contains("stele-origin")) {
      const paragraphs = stele.querySelectorAll(".stele-narrative p");
      const badge = stele.querySelector(".stele-sigil-badge");

      if (paragraphs.length) {
        steleTl.fromTo(
          paragraphs,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.65, stagger: 0.12, ease: "power2.out" },
          0.35
        );
      }
      if (badge) {
        steleTl.fromTo(
          badge,
          { opacity: 0, scale: 0.6, rotate: -60 },
          { opacity: 1, scale: 1, rotate: 0, duration: 0.9, ease: "back.out(1.4)" },
          0.4
        );
      }
    }

    // Stèle II : Arsenal (Cartes de stats & Remplissage des barres de progression)
    if (stele.classList.contains("stele-stats")) {
      const cards = stele.querySelectorAll(".stat-card");
      if (cards.length) {
        steleTl.fromTo(
          cards,
          { opacity: 0, x: 30 },
          { opacity: 1, x: 0, duration: 0.55, stagger: 0.12, ease: "power2.out" },
          0.35
        );
      }

      const bars = stele.querySelectorAll(".stat-bar-fill");
      bars.forEach((bar, bIdx) => {
        const targetWidth = bar.getAttribute("data-width") || bar.style.width || "95%";
        steleTl.fromTo(
          bar,
          { width: "0%" },
          { width: targetWidth, duration: 0.9, ease: "power2.out" },
          0.5 + bIdx * 0.1
        );
      });
    }

    // Stèle III : Forge des Mondes (Citation & 3 Blocs de piliers)
    if (stele.classList.contains("stele-forge")) {
      const quote = stele.querySelector(".stele-quote");
      const pillars = stele.querySelectorAll(".pillar-box");

      if (quote) {
        steleTl.fromTo(
          quote,
          { opacity: 0, x: -25 },
          { opacity: 1, x: 0, duration: 0.7, ease: "power2.out" },
          0.35
        );
      }
      if (pillars.length) {
        steleTl.fromTo(
          pillars,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: "power2.out" },
          0.45
        );
      }
    }

    // Stèle IV : Bonfire (Épée, Flamme spectrale & Boutons de contact)
    if (stele.classList.contains("stele-bonfire")) {
      const bonfireVisual = stele.querySelector(".bonfire-visual");
      const text = stele.querySelector(".stele-narrative");
      const buttons = stele.querySelectorAll(".bonfire-btn");

      if (bonfireVisual) {
        steleTl.fromTo(
          bonfireVisual,
          { opacity: 0, scale: 0.3, y: 15 },
          { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "back.out(1.5)" },
          0.35
        );
      }
      if (text) {
        steleTl.fromTo(
          text,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          0.45
        );
      }
      if (buttons.length) {
        steleTl.fromTo(
          buttons,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.12, ease: "power2.out" },
          0.55
        );
      }
    }
  });
}

/**
 * Simulation ultra-légère de Wisps d'humanité / braises spectrales
 */
function initAbyssWisps(section) {
  const canvas = document.getElementById("abyss-wisps-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = (canvas.width = section.offsetWidth || window.innerWidth);
  let height = (canvas.height = section.offsetHeight || window.innerHeight);

  const particles = [];
  const COUNT = 35; // Très léger, 60 FPS garanti

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 0.8,
      speedY: -(Math.random() * 0.4 + 0.15),
      speedX: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.6 + 0.2,
      pulseSpeed: Math.random() * 0.03 + 0.01,
      hue: Math.random() > 0.4 ? 205 : 42, // Bleu spectral ou or pâle
    });
  }

  let isVisible = false;
  let animId = null;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animId) {
          render();
        } else if (!isVisible && animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      });
    },
    { threshold: 0.05 }
  );

  observer.observe(section);

  window.addEventListener("resize", () => {
    width = canvas.width = section.offsetWidth || window.innerWidth;
    height = canvas.height = section.offsetHeight || window.innerHeight;
  });

  function render() {
    if (!isVisible) return;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < COUNT; i++) {
      const p = particles[i];
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.y * 0.01) * 0.2;
      p.alpha += Math.sin(Date.now() * 0.001 * p.pulseSpeed) * 0.01;

      // Réapparition en bas
      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      const currentAlpha = Math.max(0.1, Math.min(0.85, p.alpha));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.hue === 205
        ? `rgba(94, 197, 255, ${currentAlpha})`
        : `rgba(243, 208, 130, ${currentAlpha * 0.8})`;
      ctx.shadowBlur = 12;
      ctx.shadowColor = p.hue === 205 ? "rgba(94, 197, 255, 0.8)" : "rgba(243, 208, 130, 0.6)";
      ctx.fill();
    }

    animId = requestAnimationFrame(render);
  }
}

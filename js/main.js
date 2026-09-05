/**
 * main.js — Dark Fantasy Portfolio — Point d'entrée principal
 * GSAP, CustomEase, ScrollTrigger, Flip et Lenis chargés via CDN
 */
import { initLoader } from "./components/loader.js";
import { initScrollAnimations } from "./components/scroll.js";
import { initHero } from "./components/hero.js";
import { initAbout } from "./components/about.js";
import { initProjects } from "./components/projects.js";
import { initDragons } from "./components/dragons.js";

/* ── GSAP Plugins ── */
gsap.registerPlugin(CustomEase, ScrollTrigger, Flip);
CustomEase.create("hop", "0.8, 0, 0.2, 1");
CustomEase.create("hop2", "0.9, 0, 0.1, 1");
CustomEase.create("souls-ease", "0.25, 0.1, 0.25, 1");
CustomEase.create("souls-out", "0.16, 1, 0.3, 1");

/* ── Smooth Scroll (Lenis) ── */
const lenis = new Lenis({
  duration: 1.1,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: "vertical",
  gestureOrientation: "vertical",
  smoothWheel: true,
  wheelMultiplier: 1.15,
  touchMultiplier: 1.5,
});

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

/* ── Vanilla splitChars ── */
export function splitChars(selector) {
  const els = document.querySelectorAll(selector);
  els.forEach((el) => {
    const text = el.textContent;
    el.textContent = "";
    text.split("").forEach((char) => {
      const mask = document.createElement("span");
      mask.className = "char-mask";
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = char === " " ? "\u00A0" : char;
      mask.appendChild(span);
      el.appendChild(mask);
    });
  });
}

/* ══════════════════════════════════════════════════
   NAVBAR SCROLL ANIMATION — CodeGrid Flip approach
   The navbar-background + navbar-items interpolate
   from a centered 16:9 frame to fullscreen on scroll.
   The logo flips from bottom-center to top via GSAP Flip.
   ══════════════════════════════════════════════════ */
const initNavbarAnimations = () => {
  const navbarBg = document.querySelector(".navbar-background");
  const navbarItems = document.querySelector(".navbar-items");
  const navbarLogo = document.querySelector(".navbar-logo");

  if (!navbarBg || !navbarItems || !navbarLogo) return;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Set the logo to use top positioning for animation
  // Start it at the bottom of the container
  const containerHeight = navbarItems.offsetHeight;
  const logoHeight = navbarLogo.offsetHeight;
  const initialTop = containerHeight - logoHeight - 40; // 40px = ~2.5rem padding
  const finalTop = 24; // ~1.5rem from top

  gsap.set(navbarLogo, {
    top: initialTop,
    bottom: "auto",
  });

  // Create a timeline scrubbed by scroll
  const scrollTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".navbar-backdrop",
      start: "top top",
      end: `+=${viewportHeight}px`,
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });

  // Expand background + items from centered 16:9 to full viewport
  scrollTl.to([navbarBg, navbarItems], {
    width: viewportWidth,
    height: viewportHeight,
    duration: 1,
    ease: "none",
  }, 0);

  // Logo: animate from bottom to top with scale
  scrollTl.to(navbarLogo, {
    top: finalTop,
    scale: 0.65,
    duration: 1,
    ease: "none",
  }, 0);
};

/* ── Init Everything — Single DOMContentLoaded ── */
document.addEventListener("DOMContentLoaded", () => {
  // Set initial states for elements that still exist in the DOM
  gsap.set(".scroll-indicator", { opacity: 0 });
  gsap.set(".hero-side, .hero-copyright", { opacity: 0 });
  gsap.set(".navbar-links a", { opacity: 0, yPercent: 40 });
  gsap.set(".navbar-logo", { opacity: 0, y: 20 });

  // Init modules
  initLoader();
  initHero();
  initScrollAnimations();
  initAbout();
  initProjects();
  initDragons();

  // Init navbar Flip animation
  initNavbarAnimations();

  // Resize handler — recalculate on window resize
  let timer;
  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      ScrollTrigger.getAll().forEach((t) => t.kill());

      const navbarBg = document.querySelector(".navbar-background");
      const navbarItems = document.querySelector(".navbar-items");
      const navbarLogo = document.querySelector(".navbar-logo");

      if (navbarBg && navbarItems && navbarLogo) {
        gsap.set([navbarBg, navbarItems, navbarLogo], {
          clearProps: "all",
        });
      }

      initNavbarAnimations();
    }, 250);
  });
});

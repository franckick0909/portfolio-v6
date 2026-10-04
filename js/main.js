/**
 * main.js — Dark Fantasy Portfolio — Point d'entrée principal
 * GSAP, CustomEase, ScrollTrigger, Flip et Lenis chargés via CDN
 */
import { initAbout } from "./components/about.js?v=15";
import { initDragons } from "./components/dragons.js?v=15";
import { initForgeMenu } from "./components/forge-menu.js?v=5";
import { initGateReveal } from "./components/gate-reveal.js?v=15";
import { initHero } from "./components/hero.js?v=15";
import { initLoader } from "./components/loader.js?v=15";
import { initProjects } from "./components/projects.js?v=15";
import { initScrollAnimations } from "./components/scroll.js?v=15";
import { initWaterRipple } from "./components/water-ripple.js?v=15";
import { initServices } from "./components/services.js?v=1";
import { initAllTextReveals } from "./utils/text-reveal.js?v=15";

/* ── GSAP Plugins ── */
gsap.registerPlugin(CustomEase, ScrollTrigger, Flip);
CustomEase.create("hop", "0.8, 0, 0.2, 1");
CustomEase.create("hop2", "0.9, 0, 0.1, 1");
CustomEase.create("souls-ease", "0.25, 0.1, 0.25, 1");
CustomEase.create("souls-out", "0.16, 1, 0.3, 1");

/* ── Smooth Scroll (Lenis) ── */
export const lenis = new Lenis({
  duration: 1.1,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: "vertical",
  gestureOrientation: "vertical",
  smoothWheel: true,
  wheelMultiplier: 1.15,
  touchMultiplier: 1.5,
});
window.lenis = lenis;

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

/* ── Init Everything — Single DOMContentLoaded ── */
document.addEventListener("DOMContentLoaded", () => {
  // Set initial states for elements that still exist in the DOM
  gsap.set(".scroll-indicator", { opacity: 0 });
  gsap.set(".hero-side, .hero-copyright", { opacity: 0 });
  gsap.set(".navbar-logo", { opacity: 0, y: -10 });

  // Init modules
  initLoader();
  initHero();
  initScrollAnimations();
  initAbout();
  initProjects();
  initGateReveal();
  initWaterRipple();
  initDragons();
  initAllTextReveals();
  initForgeMenu();
  initServices();

  // Smooth scroll for anchor navigation links (e.g. navbar PROJETS)
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;
      if (anchor.classList.contains("project-nav-link")) return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        lenis.scrollTo(targetEl, { offset: 0, duration: 1.5 });
      }
    });
  });
});

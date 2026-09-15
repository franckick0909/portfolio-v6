/**
 * text-reveal.js — La Crapule Studio Kinetic Text Mask Reveal Utility
 * 
 * Reusable, rock-solid kinetic typography reveal.
 * Wraps content in an overflow:hidden mask and slides text smoothly
 * up into view using signature Expo/Power4 easing without ever breaking DOM text.
 */

/**
 * Ensures an element is safely masked with .reveal-mask and .reveal-inner.
 * @param {HTMLElement} el 
 * @returns {HTMLElement} the .reveal-inner element
 */
export function ensureMasked(el) {
  if (!el) return null;

  let inner = el.querySelector(":scope > .reveal-mask > .reveal-inner");
  if (inner) return inner;

  const isBlock = el.tagName === "P" || el.tagName === "DIV" || el.classList.contains("caption-desc");
  const content = el.innerHTML.trim();
  if (!content) return null;

  const mask = document.createElement("span");
  mask.className = isBlock ? "reveal-mask is-block" : "reveal-mask";

  inner = document.createElement("span");
  inner.className = isBlock ? "reveal-inner is-block" : "reveal-inner";
  inner.innerHTML = content;

  mask.appendChild(inner);
  el.innerHTML = "";
  el.appendChild(mask);

  return inner;
}

/**
 * Animate a text element with La Crapule easing.
 * @param {HTMLElement|string} target 
 * @param {Object} options 
 */
export function revealText(target, options = {}) {
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (!el) return null;

  const {
    duration = 1.0,
    delay = 0,
    ease = "power4.out",
    trigger = el,
    start = "top 88%",
    immediate = false,
    onComplete = null
  } = options;

  const inner = ensureMasked(el);
  if (!inner) return null;

  gsap.killTweensOf(inner);

  // Check if element is already in viewport
  const rect = el.getBoundingClientRect();
  const isAlreadyInView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;

  if (immediate || isAlreadyInView) {
    return gsap.fromTo(inner,
      { yPercent: 105, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration,
        delay,
        ease,
        onComplete
      }
    );
  }

  // Otherwise bind to ScrollTrigger
  if (typeof ScrollTrigger !== "undefined") {
    return gsap.fromTo(inner,
      { yPercent: 105, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration,
        delay,
        ease,
        onComplete,
        scrollTrigger: {
          trigger,
          start,
          once: true
        }
      }
    );
  }

  // Fallback
  return gsap.to(inner, { yPercent: 0, opacity: 1, duration });
}

/**
 * Universal initializer across editorial texts and headings across the site.
 */
export function initAllTextReveals(root = document) {
  // 1. Editorial section headers & labels
  const sectionHeadings = root.querySelectorAll(
    ".projects-header-tag, .hero-tag, .hero-subtitle, .hero-side-title, .hero-copyright span, .scroll-prompt, .section-forge p"
  );

  sectionHeadings.forEach((el, index) => {
    revealText(el, {
      delay: index * 0.05,
      duration: 1.1,
      ease: "power4.out"
    });
  });

  // 2. Any element explicitly decorated with [data-reveal]
  const customTargets = root.querySelectorAll("[data-reveal]");
  customTargets.forEach((el, index) => {
    const customDelay = el.dataset.revealDelay ? parseFloat(el.dataset.revealDelay) : (index * 0.05);
    revealText(el, {
      delay: customDelay,
      duration: 1.15,
      ease: "power4.out"
    });
  });
}

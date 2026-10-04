import { createLiquidMenuBg } from "./liquid-menu-bg.js?v=4";

export function initForgeMenu() {
  const navToggler = document.querySelector(".nav-toggler");
  const pageContainer = document.querySelector(".page-container");
  const menuContent = document.querySelector(".menu-content");
  const menuEl = document.querySelector(".menu");

  if (!navToggler || !pageContainer || !menuContent || !menuEl) return;

  let isMenuOpen = false;
  let currentTl = null;

  // Smooth, liquid easings
  CustomEase.create("liquidInOut", "0.72, 0, 0.08, 1");
  CustomEase.create("liquidOut", "0.22, 0.8, 0.86, 1");

  // WebGL liquid-glass background (falls back to plain CSS bg if WebGL fails)
  const liquid = createLiquidMenuBg(menuEl, "assets/images/eclipse-bg.png");

  // Animated state shared between the shader and the CSS clip-path
  const lens = { r: 0, distort: 1, zoom: 1.35, rotation: -0.25 };

  // Dimming veil over the page (cheaper than filter: brightness on the whole page)
  const dim = document.createElement("div");
  dim.className = "menu-dim";
  menuEl.before(dim);

  function applyLens() {
    menuEl.style.clipPath = `circle(${lens.r}px at 50% 50%)`;
    if (liquid) {
      liquid.uniforms.uRadius.value = lens.r;
      liquid.uniforms.uDistort.value = lens.distort;
      liquid.uniforms.uZoom.value = lens.zoom;
      if (liquid.uniforms.uRotation) {
        liquid.uniforms.uRotation.value = lens.rotation;
      }
    }
  }
  applyLens();

  // Half diagonal of the viewport = radius that covers every corner
  // circle(150% at 50% 50%) ensures full coverage including corners
  const getMaxRadius = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return Math.ceil(Math.sqrt(w * w + h * h) / 2);
  };

  // ═══════════════════════════════════════════════
  // 1. Toggle Text Animation (Menu ↔ Fermer)
  // ═══════════════════════════════════════════════
  const navToggleText = navToggler.querySelector("p");
  if (navToggleText) {
    navToggleText.innerHTML = `
      <span class="toggle-text-wrap">
        <span class="toggle-sizer">Fermer</span>
        <span class="toggle-menu">Menu</span>
        <span class="toggle-close">Fermer</span>
      </span>
    `;
    gsap.set(".toggle-close", { yPercent: 100 });
  }

  // ═══════════════════════════════════════════════
  // 2. Lock/Unlock scroll (no layout change → nothing breaks)
  // ═══════════════════════════════════════════════
  function lockPage() {
    if (window.lenis) window.lenis.stop();
    document.documentElement.classList.add("menu-open");
    // Scale the page around the *visible* center of the viewport
    const cy = (window.scrollY || 0) + window.innerHeight / 2;
    gsap.set(pageContainer, { transformOrigin: `50% ${cy}px` });
  }

  function unlockPage() {
    document.documentElement.classList.remove("menu-open");
    if (window.lenis) window.lenis.start();
    gsap.set(pageContainer, { clearProps: "transform,transformOrigin" });
  }

  // Initial states of the menu content
  gsap.set(menuContent, { scale: 1.15, rotation: -4, opacity: 0, filter: "blur(8px)" });
  gsap.set(".menu-link", { yPercent: 60, opacity: 0 });
  gsap.set(".menu-secondary-link, .menu-footer", { y: 20, opacity: 0 });

  // ═══════════════════════════════════════════════
  // 3. Open Menu — liquid glass lens grows from the center
  // ═══════════════════════════════════════════════
  function openMenu() {
    isMenuOpen = true;
    if (currentTl) currentTl.kill();

    lockPage();
    menuEl.classList.add("is-visible");
    if (liquid) liquid.play();

    const D = 1.8; // main duration
    const maxR = getMaxRadius() + 4;

    currentTl = gsap.timeline({ defaults: { overwrite: "auto" } });

    // Toggle text: Menu → Fermer
    currentTl.to(
      ".toggle-menu",
      { yPercent: -100, duration: 0.7, ease: "liquidInOut" },
      0,
    );
    currentTl.to(
      ".toggle-close",
      { yPercent: 0, duration: 0.7, ease: "liquidInOut" },
      0,
    );

    // Lens radius (shader + clip-path in sync)
    currentTl.to(
      lens,
      { r: maxR, duration: D, ease: "liquidInOut", onUpdate: applyLens },
      0,
    );
    // Lens rotation in sync with the expanding liquid effect
    currentTl.fromTo(
      lens,
      { rotation: -0.25 },
      {
        rotation: 0,
        duration: D * 1.1,
        ease: "liquidOut",
        onUpdate: applyLens,
      },
      0,
    );
    // Liquid refraction stays strong while growing, then settles flat
    currentTl.to(
      lens,
      {
        distort: 0,
        duration: D * 0.85,
        ease: "power2.inOut",
        onUpdate: applyLens,
      },
      D * 0.3,
    );
    currentTl.to(
      lens,
      { zoom: 1, duration: D * 1.1, ease: "liquidOut", onUpdate: applyLens },
      0.1,
    );

    // Page behind sinks back
    currentTl.to(
      pageContainer,
      {
        scale: 0.9,
        duration: D,
        ease: "liquidInOut",
      },
      0,
    );
    currentTl.to(dim, { opacity: 0.65, duration: D, ease: "liquidInOut" }, 0);

    // Menu content focuses in like through a lens, rotating to 0
    currentTl.to(
      menuContent,
      {
        scale: 1,
        rotation: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: D * 1.4,
        ease: "liquidOut",
      },
      D * 0.35,
    );

    currentTl.to(
      ".menu-link",
      {
        yPercent: 0,
        opacity: 1,
        duration: 1.1,
        stagger: 0.08,
        ease: "liquidOut",
      },
      D * 0.45,
    );

    currentTl.to(
      ".menu-secondary-link, .menu-footer",
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.06,
        ease: "liquidOut",
      },
      D * 0.65,
    );

    // Once settled, stop rendering every frame (static image = 0 GPU cost)
    currentTl.call(() => {
      if (liquid) {
        liquid.stop();
        liquid.render();
      }
    });
  }

  // ═══════════════════════════════════════════════
  // 4. Close Menu — lens liquefies and collapses to the center
  // ═══════════════════════════════════════════════
  function closeMenu(onComplete) {
    isMenuOpen = false;
    if (currentTl) currentTl.kill();
    if (liquid) liquid.play();

    const D = 1.4;

    currentTl = gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: () => {
        menuEl.classList.remove("is-visible");
        if (liquid) liquid.stop();
        unlockPage();
        if (onComplete) onComplete();
      },
    });

    // Toggle text: Fermer → Menu
    currentTl.to(
      ".toggle-close",
      { yPercent: 100, duration: 0.8, ease: "liquidInOut" },
      0,
    );
    currentTl.to(
      ".toggle-menu",
      { yPercent: 0, duration: 0.8, ease: "liquidInOut" },
      0,
    );

    // Content leaves first
    currentTl.to(
      ".menu-secondary-link, .menu-footer",
      {
        y: -15,
        opacity: 0,
        duration: 0.45,
        stagger: 0.03,
        ease: "power2.in",
      },
      0,
    );
    currentTl.to(
      ".menu-link",
      {
        yPercent: -50,
        opacity: 0,
        duration: 0.55,
        stagger: 0.05,
        ease: "power2.in",
      },
      0,
    );
    currentTl.to(
      menuContent,
      {
        scale: 1.15,
        rotation: 4,
        opacity: 0,
        filter: "blur(8px)",
        duration: 0.8,
        ease: "power2.in",
      },
      0.15,
    );

    // Liquefy first, then collapse the lens with rotation
    currentTl.to(
      lens,
      {
        distort: 1,
        duration: D * 0.6,
        ease: "power2.inOut",
        onUpdate: applyLens,
      },
      0.1,
    );
    currentTl.to(
      lens,
      {
        rotation: 0.25,
        duration: D,
        ease: "liquidInOut",
        onUpdate: applyLens,
      },
      0.2,
    );
    currentTl.to(
      lens,
      { zoom: 1.35, duration: D, ease: "liquidInOut", onUpdate: applyLens },
      0.25,
    );
    currentTl.to(
      lens,
      { r: 0, duration: D, ease: "liquidInOut", onUpdate: applyLens },
      0.25,
    );

    // Page comes back to the front
    currentTl.to(
      pageContainer,
      {
        scale: 1,
        duration: D,
        ease: "liquidInOut",
      },
      0.25,
    );
    currentTl.to(dim, { opacity: 0, duration: D, ease: "liquidInOut" }, 0.25);

    // Reset content for next opening
    currentTl.set(".menu-link", { yPercent: 60 });
    currentTl.set(".menu-secondary-link, .menu-footer", { y: 20 });
    currentTl.set(menuContent, { rotation: -4, scale: 1.15 });
    currentTl.set(lens, { rotation: -0.25 });
  }

  // ═══════════════════════════════════════════════
  // 5. Toggle Events
  // ═══════════════════════════════════════════════
  navToggler.addEventListener("click", () => {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // ═══════════════════════════════════════════════
  // 6. Hover Links SplitText Animation
  // ═══════════════════════════════════════════════
  const hoverLinks = document.querySelectorAll(
    ".menu-link a, .menu-secondary-link a",
  );

  hoverLinks.forEach((link) => {
    const text = (link.dataset.originalText || link.textContent).trim();
    link.dataset.originalText = text;
    link.innerHTML = `<span class="line original">${text}</span><span class="line clone" aria-hidden="true">${text}</span>`;

    const originalChars = new SplitText(link.querySelector(".original"), {
      type: "chars",
      charsClass: "char",
    }).chars;

    const cloneChars = new SplitText(link.querySelector(".clone"), {
      type: "chars",
      charsClass: "char",
    }).chars;

    gsap.set(link.querySelector(".clone"), { yPercent: -100 });
    const pairs = originalChars.flatMap((char, i) => [char, cloneChars[i]]);

    link.addEventListener("mouseenter", () => {
      gsap.to(pairs, {
        yPercent: 100,
        stagger: { amount: 0.2 },
        duration: 0.4,
        ease: "power3.out",
        overwrite: true,
      });
    });

    link.addEventListener("mouseleave", () => {
      gsap.to(pairs, {
        yPercent: 0,
        stagger: { amount: 0.2, from: "end" },
        duration: 0.4,
        ease: "power3.out",
        overwrite: true,
      });
    });

    // ═══════════════════════════════════════════════
    // 7. Click Link → Close Menu & Navigate
    // ═══════════════════════════════════════════════
    if (link.closest(".menu-link")) {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href");

        if (!isMenuOpen) return;

        closeMenu(() => {
          if (targetId && targetId.startsWith("#")) {
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
              requestAnimationFrame(() => {
                if (window.lenis) {
                  window.lenis.scrollTo(targetEl, { duration: 1.2, offset: 0 });
                } else {
                  targetEl.scrollIntoView({ behavior: "smooth" });
                }

                // Entrance animation for the target section
                gsap.fromTo(
                  targetEl,
                  { opacity: 0, y: 60, scale: 0.98 },
                  {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1.5,
                    ease: "power3.out",
                    clearProps: "all",
                  },
                );
              });
            }
          }
        });
      });
    }
  });

  // ═══════════════════════════════════════════════
  // 8. Keyboard Escape
  // ═══════════════════════════════════════════════
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMenuOpen) {
      closeMenu();
    }
  });
}

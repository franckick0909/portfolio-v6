/**
 * projects.js — Interactive Projects Showcase (La Crapule Studio & Fame Estate Style)
 *
 * - Single image per project link.
 * - Entrance: Double scale + polygon clip-path reveal with inner de-zoom (1.5 -> 1.0)
 *   and rotation straightening.
 * - Exit: Ultra-smooth, fluid fade-out & soft scale down (lacrapulestudio.com/about-us style).
 * - Left column: Minimalist links with Malvah scaleX hover.
 * - Right column: Large semi-transparent image overlapping over the links.
 */

export function initProjects() {
  const navList = document.querySelector(".projects-nav-list");
  const navItems = document.querySelectorAll(".project-nav-item");
  const rawImages = document.querySelectorAll(".project-hero-img");
  const captionItems = document.querySelectorAll(".project-caption-item");

  if (!navItems.length || !rawImages.length) return;

  /* ── 1. Wrap each image in .project-img-wrap for independent clip-path & scale ── */
  setupCaptionSplits(captionItems);

  const wrappers = [];
  const inners = [];

  rawImages.forEach((img, i) => {
    // If not already wrapped
    let wrapper = img.parentElement.classList.contains("project-img-wrap")
      ? img.parentElement
      : null;

    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.className = "project-img-wrap";
      wrapper.dataset.index = i;
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);
    }

    wrappers.push(wrapper);
    inners.push(img);
  });

  const initRotations = [6, -4, -7, 5, -5];

  /* ── 2. Set initial states for all images ── */
  gsap.set(wrappers, {
    rotation: (i) => initRotations[i] || 0,
    scale: 0,
    opacity: 0,
    clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
    transformOrigin: "50% 50%",
    zIndex: 0,
  });

  gsap.set(inners, {
    scale: 1.5,
    opacity: 1,
    transformOrigin: "50% 50%",
  });

  let currentActiveIndex = -1;
  let hasRevealedOnce = false;

  /* ── 3. Image Entrance Animation (Double Scale + Clip-Path) ── */
  function enterImage(index) {
    const wrap = wrappers[index];
    const inner = inners[index];
    if (!wrap || !inner) return;

    gsap.killTweensOf(wrap);
    gsap.killTweensOf(inner);

    // Bring this wrapper to the very top
    gsap.set(wrap, {
      zIndex: 4,
      opacity: 0.62, // Transparence renforcée pour voir les liens dessous
      rotation: initRotations[index] || 0,
      scale: 0,
      clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
    });

    gsap.set(inner, {
      scale: 1.5,
      transformOrigin: "50% 50%",
    });

    // Animate wrapper: expands from center + straightens rotation
    gsap.to(wrap, {
      rotation: 0,
      scale: 1,
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 0.88,
      ease: "power3.out",
    });

    // Animate inner image: counter-scales (zooms out from 1.5 to 1.0)
    gsap.to(inner, {
      scale: 1,
      duration: 0.88,
      ease: "power3.out",
    });
  }

  /* ── 4. Image Exit Animation: Scale > 1 and ultra-soft opacity fade ── */
  function exitImage(index) {
    const wrap = wrappers[index];
    const inner = inners[index];
    if (!wrap || !inner) return;

    gsap.killTweensOf(wrap);
    gsap.killTweensOf(inner);

    // Lower zIndex so new entering image stays above
    gsap.set(wrap, { zIndex: 1 });

    gsap.to(wrap, {
      opacity: 0,
      scale: 1.07, // Scale un peu plus grand que 1 à la sortie
      duration: 0.75,
      ease: "power2.out",
      onComplete: () => {
        gsap.set(wrap, {
          zIndex: 0,
          scale: 0,
          clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
          rotation: initRotations[index] || 0,
        });
      },
    });

    gsap.to(inner, {
      scale: 1.1,
      duration: 0.75,
      ease: "power2.out",
    });
  }

  /* ── 5. Activate Project by Index ── */
  function activateProject(index) {
    if (index === currentActiveIndex) return;

    const prevIndex = currentActiveIndex;
    currentActiveIndex = index;

    // A. Update left navigation items
    navItems.forEach((item, idx) => {
      if (idx === index) {
        item.classList.add("is-active");
      } else {
        item.classList.remove("is-active");
      }
    });

    // B. Exit previous image with ultra-smooth soft fade
    if (prevIndex !== -1 && prevIndex !== index) {
      exitImage(prevIndex);
    }

    // C. Enter new image with double scale + polygon clip-path reveal
    if (index !== -1) {
      enterImage(index);
    }

    // D. Switch captions with line-by-line staggered reveal (Craig Roblewsky / CodePen style)
    captionItems.forEach((cap, idx) => {
      if (idx === index) {
        cap.classList.add("is-active");

        const lineChildren = cap.querySelectorAll(".lineChild");
        const badges = cap.querySelectorAll(".caption-badges span");

        gsap.killTweensOf(lineChildren);
        gsap.killTweensOf(badges);

        // All lines (.lineChild) reveal sequentially from yPercent: 110 to 0 with stagger
        gsap.fromTo(
          lineChildren,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.75,
            stagger: 0.08,
            ease: "power4.out",
          },
        );

        if (badges.length) {
          gsap.fromTo(
            badges,
            { opacity: 0, y: 8 },
            {
              opacity: 1,
              y: 0,
              duration: 0.45,
              stagger: 0.03,
              delay: 0.25,
              ease: "power2.out",
            },
          );
        }
      } else {
        cap.classList.remove("is-active");
      }
    });
  }

  let leaveTimeout = null;

  function clearLeaveTimeout() {
    if (leaveTimeout) {
      clearTimeout(leaveTimeout);
      leaveTimeout = null;
    }
  }

  /* ── 6. CodeGrid Direction-Aware Continuous Rolling Engine (Henri Heymans Style) ── */
  const POSITIONS = {
    BOTTOM: 0,
    MIDDLE: -62,
    TOP: -124,
  };

  navItems.forEach((item, idx) => {
    const wrapper = item.querySelector(".project-nav-wrapper");
    if (!wrapper) return;

    // État initial : le projet 0 est au milieu, les autres en haut
    let currentPosition = idx === 0 ? POSITIONS.MIDDLE : POSITIONS.TOP;
    gsap.set(wrapper, { y: currentPosition });

    item.addEventListener("mouseenter", (e) => {
      clearLeaveTimeout();
      activateProject(idx);

      const rect = item.getBoundingClientRect();
      const enterFromTop = e.clientY < rect.top + rect.height / 2;

      // Si entrée par le haut et était en bas, on aligne en haut pour rouler vers le bas
      if (enterFromTop && currentPosition === POSITIONS.BOTTOM) {
        gsap.set(wrapper, { y: POSITIONS.TOP });
      } else if (!enterFromTop && currentPosition === POSITIONS.TOP) {
        // Si entrée par le bas et était en haut, on aligne en bas pour rouler vers le haut
        gsap.set(wrapper, { y: POSITIONS.BOTTOM });
      }

      currentPosition = POSITIONS.MIDDLE;
      gsap.to(wrapper, {
        y: POSITIONS.MIDDLE,
        duration: 0.4,
        ease: "power2.out",
      });
    });

    item.addEventListener("mouseleave", (e) => {
      const rect = item.getBoundingClientRect();
      const leavingFromTop = e.clientY < rect.top + rect.height / 2;

      currentPosition = leavingFromTop ? POSITIONS.TOP : POSITIONS.BOTTOM;
      gsap.to(wrapper, {
        y: currentPosition,
        duration: 0.4,
        ease: "power2.out",
      });
    });

    item.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearLeaveTimeout();
      activateProject(idx);
    });
  });

  /* ── 7. Mouseleave on navigation list: ultra-smooth fluid exit like La Crapule ── */
  if (navList) {
    navList.addEventListener("mouseleave", () => {
      clearLeaveTimeout();
      leaveTimeout = setTimeout(() => {
        if (currentActiveIndex !== -1) {
          const exitingIndex = currentActiveIndex;
          exitImage(exitingIndex);

          navItems.forEach((item) => {
            item.classList.remove("is-active");
            const wrapper = item.querySelector(".project-nav-wrapper");
            if (wrapper) {
              gsap.to(wrapper, {
                y: POSITIONS.TOP,
                duration: 0.4,
                ease: "power2.out",
              });
            }
          });
          captionItems.forEach((cap) => cap.classList.remove("is-active"));
          currentActiveIndex = -1;
        }
      }, 140);
    });
  }

  /* ── 8. Initial ScrollTrigger: reveal Project 0 when section enters ── */
  function tryRevealFirst() {
    if (!hasRevealedOnce && currentActiveIndex === -1) {
      hasRevealedOnce = true;
      activateProject(0);
    }
  }

  // Check if section is already in viewport on page load/refresh
  const sectionEl = document.querySelector(".section-projects");
  if (sectionEl) {
    const rect = sectionEl.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.8 && rect.bottom > 0) {
      tryRevealFirst();
    }
  }

  if (typeof ScrollTrigger !== "undefined" && typeof gsap !== "undefined") {
    ScrollTrigger.create({
      trigger: ".section-projects",
      start: "top 75%",
      once: true,
      onEnter: () => {
        tryRevealFirst();
      },
    });

    // Nav list entrance animation on scroll
    gsap.from(navItems, {
      opacity: 0,
      x: -25,
      duration: 0.8,
      stagger: 0.09,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".projects-nav-list",
        start: "top 80%",
      },
    });

    // Parallaxe cinématographique sur l'image d'intérieur de la cathédrale
    const chamberBg = document.querySelector(".chamber-bg-image");
    if (chamberBg) {
      gsap.to(chamberBg, {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
          trigger: ".section-projects",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }
  }

  // Initialisation de l'ambiance dynamique
  initChamberAmbient();
}

/**
 * Révélation dramatique de la section Seuil sur le scroll
 */
function initThresholdAnimation() {
  const threshold = document.querySelector(".section-threshold");
  if (!threshold || typeof gsap === "undefined") return;

  const act = threshold.querySelector(".threshold-act");
  const title = threshold.querySelector(".threshold-title");
  const desc = threshold.querySelector(".threshold-desc");
  const footer = threshold.querySelector(".threshold-footer");

  gsap.from([act, title, desc, footer], {
    opacity: 0,
    y: 30,
    duration: 1.0,
    stagger: 0.15,
    ease: "power3.out",
    scrollTrigger: {
      trigger: threshold,
      start: "top 70%",
      once: true,
    },
  });
}

/**
 * Arrière-plan dynamique de la nef intérieure du château
 * - Brume volumétrique rampante
 * - Poussières de pierre & particules spectrales en suspension
 * - Lueur de torche/lanterne qui suit délicatement le curseur
 */
function initChamberAmbient() {
  const canvas = document.getElementById("chamber-ambient-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = (canvas.width =
    canvas.parentElement.offsetWidth || window.innerWidth);
  let height = (canvas.height =
    canvas.parentElement.offsetHeight || window.innerHeight);

  window.addEventListener("resize", () => {
    if (!canvas.parentElement) return;
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  });

  // Motes / Poussières spectrales
  const motesCount = 45;
  const motes = [];
  for (let i = 0; i < motesCount; i++) {
    motes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.8 + 0.6,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(Math.random() * 0.4 + 0.15),
      alpha: Math.random() * 0.5 + 0.15,
      baseAlpha: Math.random() * 0.5 + 0.15,
    });
  }

  // Position souris douce pour halo lumineux
  const mouseLight = {
    x: width * 0.5,
    y: height * 0.4,
    targetX: width * 0.5,
    targetY: height * 0.4,
  };
  window.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    if (e.clientY >= rect.top - 200 && e.clientY <= rect.bottom + 200) {
      mouseLight.targetX = e.clientX - rect.left;
      mouseLight.targetY = e.clientY - rect.top;
    }
  });

  function renderAmbient() {
    ctx.clearRect(0, 0, width, height);

    // 1. Halo doux interactif
    mouseLight.x += (mouseLight.targetX - mouseLight.x) * 0.04;
    mouseLight.y += (mouseLight.targetY - mouseLight.y) * 0.04;

    const grad = ctx.createRadialGradient(
      mouseLight.x,
      mouseLight.y,
      10,
      mouseLight.x,
      mouseLight.y,
      450,
    );
    grad.addColorStop(0, "rgba(255, 255, 255, 0.045)");
    grad.addColorStop(0.5, "rgba(255, 255, 255, 0.015)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Particules de poussières de pierre & braises blanches en suspension
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < motes.length; i++) {
      const m = motes[i];
      m.x += m.vx;
      m.y += m.vy;

      if (m.y < 0) {
        m.y = height + 10;
        m.x = Math.random() * width;
      }
      if (m.x < 0) m.x = width;
      if (m.x > width) m.x = 0;

      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${m.alpha})`;
      ctx.fill();
    }

    requestAnimationFrame(renderAmbient);
  }

  renderAmbient();
}

/**
 * Splits text into .lineParent (overflow: hidden) and .lineChild (yPercent: 100 -> 0)
 * exactly matching Craig Roblewsky's CodePen "SplitText line overflow:hidden v2".
 */
function setupCaptionSplits(captionItems) {
  captionItems.forEach((cap) => {
    // 1. Tag & Title: wrap in lineParent / lineChild
    const tag = cap.querySelector(".caption-tag");
    if (tag && !tag.querySelector(".lineParent")) {
      const tagText = tag.textContent.trim();
      tag.innerHTML = `<span class="lineParent"><span class="lineChild">${tagText}</span></span>`;
    }

    const title = cap.querySelector(".caption-title");
    if (title && !title.querySelector(".lineParent")) {
      const titleText = title.textContent.trim();
      title.innerHTML = `<span class="lineParent"><span class="lineChild">${titleText}</span></span>`;
    }

    // 2. Paragraph .caption-desc (single clean <p> tag from HTML)
    const desc = cap.querySelector(".caption-desc");
    if (desc && !desc.dataset.splitDone) {
      desc.dataset.splitDone = "true";
      const fullText = desc.textContent.trim();
      desc.dataset.originalText = fullText;
      splitParagraphIntoLines(desc);
    }
  });

  // Re-split on window resize with debounce to adapt line wrapping to screen size
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      captionItems.forEach((cap) => {
        const desc = cap.querySelector(".caption-desc");
        if (desc && desc.dataset.originalText) {
          desc.textContent = desc.dataset.originalText;
          splitParagraphIntoLines(desc);
        }
      });
    }, 250);
  });
}

function splitParagraphIntoLines(el) {
  if (typeof window.SplitText === "function") {
    try {
      new window.SplitText(el, { type: "lines", linesClass: "lineChild" });
      new window.SplitText(el, { type: "lines", linesClass: "lineParent" });
      return;
    } catch (e) {
      console.warn("SplitText fallback", e);
    }
  }

  // Pure vanilla line calculation (Craig Roblewsky lineParent / lineChild architecture)
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words
    .map((w) => `<span class="split-probe">${w}</span>`)
    .join(" ");

  const probes = Array.from(el.querySelectorAll(".split-probe"));
  const lines = [];
  let currentLine = [];
  let currentTop = null;

  probes.forEach((probe) => {
    const top = probe.offsetTop;
    if (currentTop === null || Math.abs(top - currentTop) < 6) {
      currentLine.push(probe.textContent);
      currentTop = top;
    } else {
      lines.push(currentLine.join(" "));
      currentLine = [probe.textContent];
      currentTop = top;
    }
  });
  if (currentLine.length) lines.push(currentLine.join(" "));

  el.innerHTML = lines
    .map(
      (lineText) =>
        `<span class="lineParent"><span class="lineChild">${lineText}</span></span>`,
    )
    .join("");
}

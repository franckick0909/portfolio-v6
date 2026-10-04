/**
 * mobile-menu.js — Dual-Door Split Menu & Dark Souls III Red Eclipse
 * 
 * Features:
 * - Button "MENU" ⇄ "FERMER" with letter-by-letter stagger morphing.
 * - Ultra-smooth cinematic dual sliding doors from left and right meeting at center.
 * - Symmetrical Dark Souls 3 Darksign background split across both doors.
 * - Incandescent red eclipse sun igniting at top center.
 * - Descending vertical red laser beam traveling down the seam.
 * - Left panel: Double-layer kinetic typography with laser flare underline and ancient runes.
 * - Right panel: Staggered blur-to-sharp entrance of socials and direct email card.
 * - Closing sequence: gentle, silky smooth reverse path.
 * - Interactive email copy button with visual feedback.
 * - Smooth Lenis scroll on nav link click.
 */

export function initMobileMenu() {
  const toggleWrap = document.getElementById("navToggleWrap");
  const menuOverlay = document.getElementById("navMenuWrap");
  const backdrop = document.getElementById("splitBackdrop");
  const doorLeft = document.getElementById("doorLeft");
  const doorRight = document.getElementById("doorRight");
  const eclipseCluster = document.getElementById("eclipseCluster");
  const eclipseBeam = document.getElementById("eclipseBeam");
  const canvas = document.getElementById("splitAmbientCanvas");

  // Letters for morphing
  const menuLetters = toggleWrap ? toggleWrap.querySelectorAll(".word-menu .letter") : [];
  const fermerLetters = toggleWrap ? toggleWrap.querySelectorAll(".word-fermer .letter") : [];

  // Left Door Elements
  const leftHeader = doorLeft ? doorLeft.querySelectorAll(".left-nav-header .menu-mask > *") : [];
  const navLinks = doorLeft ? doorLeft.querySelectorAll(".split-nav-link") : [];
  const leftFooter = doorLeft ? doorLeft.querySelectorAll(".left-nav-footer .menu-mask > *") : [];

  // Right Door Elements
  const rightHeader = doorRight ? doorRight.querySelectorAll(".right-socials-header .menu-mask > *") : [];
  const socialItems = doorRight ? doorRight.querySelectorAll(".split-social-link") : [];
  const emailCard = doorRight ? doorRight.querySelector(".split-email-card") : null;
  const rightFooter = doorRight ? doorRight.querySelectorAll(".right-socials-footer .menu-mask > *") : [];

  // Email elements
  const copyBtn = document.getElementById("copyEmailBtn");
  const copyText = copyBtn ? copyBtn.querySelector(".copy-text") : null;
  const copySuccess = copyBtn ? copyBtn.querySelector(".copy-success") : null;

  if (!toggleWrap || !menuOverlay || !doorLeft || !doorRight) return;

  let isMenuOpen = false;
  let isAnimating = false;
  let activeTimeline = null;

  /* ══════════════════════════════════════════════════
     1. Initial States (GSAP)
     ══════════════════════════════════════════════════ */
  // Button initial letters
  gsap.set(menuLetters, { yPercent: 0, opacity: 1 });
  gsap.set(fermerLetters, { yPercent: 120, opacity: 0 });

  // Initial doors & central axis
  gsap.set(doorLeft, { x: "-100%", force3D: true });
  gsap.set(doorRight, { x: "100%", force3D: true });
  gsap.set(eclipseCluster, { scale: 0.25, opacity: 0, force3D: true });
  gsap.set(eclipseBeam, { scaleY: 0, transformOrigin: "top center", force3D: true });

  // Initial content with ethereal blur and soft vertical offset
  gsap.set([leftHeader, navLinks, leftFooter], { y: 35, opacity: 0, filter: "blur(8px)" });
  gsap.set([rightHeader, socialItems, rightFooter], { y: 35, opacity: 0, filter: "blur(8px)" });
  if (emailCard) {
    gsap.set(emailCard, { y: 35, opacity: 0, filter: "blur(8px)" });
  }

  /* ══════════════════════════════════════════════════
     2. Ambient Floating Embers & Crimson Ash Canvas
     ══════════════════════════════════════════════════ */
  let animFrameId = null;
  const particles = [];
  const particleCount = 35;

  function initAmbientCanvas() {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!isMenuOpen) return;
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    particles.length = 0;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 0.6,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -(Math.random() * 0.6 + 0.25),
        alpha: Math.random() * 0.6 + 0.2,
        decay: Math.random() * 0.003 + 0.001,
        color:
          Math.random() > 0.4
            ? "255, 42, 75" // Bright Crimson Red
            : Math.random() > 0.2
            ? "255, 120, 140" // Rose Flame
            : "255, 210, 180", // White-hot Ember
      });
    }

    function loop() {
      if (!isMenuOpen) return;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.y < -15 || p.alpha <= 0) {
          p.x = Math.random() * w;
          p.y = h + 15;
          p.alpha = Math.random() * 0.6 + 0.25;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.shadowColor = `rgba(${p.color}, 0.8)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      animFrameId = requestAnimationFrame(loop);
    }

    loop();
  }

  function stopAmbientCanvas() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  /* ══════════════════════════════════════════════════
     3. Opening Animation Sequence (Velvety Smooth)
     ══════════════════════════════════════════════════ */
  function openMenu() {
    if (isAnimating || isMenuOpen) return;
    isAnimating = true;
    isMenuOpen = true;

    if (activeTimeline) {
      activeTimeline.kill();
    }

    menuOverlay.classList.add("is-open");
    menuOverlay.setAttribute("aria-hidden", "false");
    toggleWrap.classList.add("is-open");
    toggleWrap.setAttribute("aria-label", "Fermer le menu");
    document.body.classList.add("menu-open");

    initAmbientCanvas();

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating = false;
        activeTimeline = null;
        // Clear transform and filter so CSS transitions on hover operate with native GPU fluidity
        gsap.set(navLinks, { clearProps: "transform,filter" });
        gsap.set(socialItems, { clearProps: "transform,filter" });
        if (emailCard) gsap.set(emailCard, { clearProps: "transform,filter" });
      },
    });
    activeTimeline = tl;

    // A. Button Letter Morph: "MENU" rolls out, "FERMER" rolls in (crystal clear metrics)
    tl.to(
      menuLetters,
      {
        yPercent: -120,
        opacity: 0,
        stagger: 0.02,
        duration: 0.35,
        ease: "power2.inOut",
      },
      0
    );

    tl.fromTo(
      fermerLetters,
      { yPercent: 120, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        stagger: 0.02,
        duration: 0.45,
        ease: "power3.out",
      },
      0.08
    );

    // B. Atmospheric backdrop fades in gently
    if (backdrop) {
      tl.to(
        backdrop,
        {
          opacity: 1,
          duration: 1.15,
          ease: "power2.out",
        },
        0
      );
    }

    // C. Dual Doors slide in with deep, weighted cinematic glide (power3.out, 1.1s)
    tl.to(
      doorLeft,
      {
        x: "0%",
        duration: 1.1,
        ease: "power3.out",
        force3D: true,
      },
      0.03
    );

    tl.to(
      doorRight,
      {
        x: "0%",
        duration: 1.1,
        ease: "power3.out",
        force3D: true,
      },
      0.03
    );

    // D. Red Eclipse Circle ignites smoothly at top-center seam
    tl.fromTo(
      eclipseCluster,
      { scale: 0.25, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.85,
        ease: "power2.out",
        force3D: true,
      },
      0.28
    );

    // E. Red Laser Beam descends straight down the vertical seam to bottom
    tl.fromTo(
      eclipseBeam,
      { scaleY: 0 },
      {
        scaleY: 1,
        duration: 0.92,
        ease: "power2.out",
        force3D: true,
      },
      0.35
    );

    // F. Left Panel Links cascade in with blur-to-sharp ethereal reveal
    tl.to(
      leftHeader,
      {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.7,
        ease: "power3.out",
      },
      0.45
    );

    tl.to(
      navLinks,
      {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        stagger: 0.05,
        duration: 0.75,
        ease: "power3.out",
      },
      0.5
    );

    tl.to(
      leftFooter,
      {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.6,
        ease: "power2.out",
      },
      0.7
    );

    // G. Right Panel Content reveals with blur-to-sharp ethereal reveal
    tl.to(
      rightHeader,
      {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.7,
        ease: "power3.out",
      },
      0.46
    );

    tl.to(
      socialItems,
      {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        stagger: 0.05,
        duration: 0.75,
        ease: "power3.out",
      },
      0.52
    );

    if (emailCard) {
      tl.to(
        emailCard,
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.7,
          ease: "power3.out",
        },
        0.62
      );
    }

    tl.to(
      rightFooter,
      {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.6,
        ease: "power2.out",
      },
      0.72
    );
  }

  /* ══════════════════════════════════════════════════
     4. Closing Animation Sequence (Gentle & Smooth Reverse)
     ══════════════════════════════════════════════════ */
  function closeMenu(onClosedCallback) {
    if (isAnimating || !isMenuOpen) return;
    isAnimating = true;
    isMenuOpen = false;

    if (activeTimeline) {
      activeTimeline.kill();
    }

    toggleWrap.classList.remove("is-open");
    toggleWrap.setAttribute("aria-label", "Ouvrir le menu");

    // Reset any lingering hover offsets
    gsap.set([navLinks, socialItems], { x: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating = false;
        activeTimeline = null;
        menuOverlay.classList.remove("is-open");
        menuOverlay.setAttribute("aria-hidden", "true");
        document.body.classList.remove("menu-open");
        stopAmbientCanvas();

        if (typeof onClosedCallback === "function") {
          onClosedCallback();
        }
      },
    });
    activeTimeline = tl;

    // Step 1: Red Beam retracts smoothly UP into the circle
    tl.to(
      eclipseBeam,
      {
        scaleY: 0,
        duration: 0.3,
        ease: "power3.in",
        force3D: true,
      },
      0
    );

    // Step 2: Red Eclipse Ring shrinks and dims gently
    tl.to(
      eclipseCluster,
      {
        scale: 0.25,
        opacity: 0,
        duration: 0.26,
        ease: "power2.in",
        force3D: true,
      },
      0.04
    );

    // Step 3: Nav links & Socials & Email glide down softly with gentle blur
    const rightGroup = emailCard ? [rightFooter, emailCard, socialItems, rightHeader] : [rightFooter, socialItems, rightHeader];
    tl.to(
      rightGroup,
      {
        y: 30,
        opacity: 0,
        filter: "blur(6px)",
        duration: 0.28,
        stagger: 0.012,
        ease: "power2.in",
      },
      0.02
    );

    tl.to(
      [leftFooter, navLinks, leftHeader],
      {
        y: 30,
        opacity: 0,
        filter: "blur(6px)",
        duration: 0.28,
        stagger: 0.012,
        ease: "power2.in",
      },
      0.04
    );

    // Step 4: The two doors split and slide open with smooth deceleration
    tl.to(
      doorLeft,
      {
        x: "-100%",
        duration: 0.9,
        ease: "power3.inOut",
        force3D: true,
      },
      0.14
    );

    tl.to(
      doorRight,
      {
        x: "100%",
        duration: 0.9,
        ease: "power3.inOut",
        force3D: true,
      },
      0.14
    );

    // Step 5: Backdrop fades out
    if (backdrop) {
      tl.to(
        backdrop,
        {
          opacity: 0,
          duration: 0.6,
          ease: "power2.inOut",
        },
        0.18
      );
    }

    // Step 6: Button morphs: "FERMER" rolls out, "MENU" rolls back in
    tl.to(
      fermerLetters,
      {
        yPercent: 120,
        opacity: 0,
        stagger: 0.015,
        duration: 0.28,
        ease: "power2.in",
      },
      0.14
    );

    tl.fromTo(
      menuLetters,
      { yPercent: -120, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        stagger: 0.02,
        duration: 0.36,
        ease: "power3.out",
      },
      0.22
    );
  }

  /* ══════════════════════════════════════════════════
     5. Interactions & Event Listeners
     ══════════════════════════════════════════════════ */
  // Toggle Button Click
  toggleWrap.addEventListener("click", (e) => {
    e.preventDefault();
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Navigation Links Click -> Item chosen ignition + smooth close + Lenis scroll
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetSelector = link.getAttribute("href");

      // Flash ignition effect on chosen link
      link.classList.add("is-chosen");

      setTimeout(() => {
        closeMenu(() => {
          link.classList.remove("is-chosen");

          if (targetSelector && targetSelector.startsWith("#")) {
            const targetEl = document.querySelector(targetSelector);
            if (targetEl) {
              if (window.lenis) {
                window.lenis.scrollTo(targetEl, { offset: 0, duration: 1.3 });
              } else {
                targetEl.scrollIntoView({ behavior: "smooth" });
              }
            }
          }
        });
      }, 180);
    });
  });

  // Copy Email Button Interaction
  if (copyBtn) {
    copyBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const email = "franckick2@gmail.com";

      navigator.clipboard.writeText(email).then(() => {
        if (copyText && copySuccess) {
          copyText.style.display = "none";
          copySuccess.style.display = "inline";
          copyBtn.style.borderColor = "#ffffff";
          copyBtn.style.color = "#ffffff";
          copyBtn.style.background = "rgba(255, 42, 75, 0.4)";
          copyBtn.style.boxShadow = "0 0 16px rgba(255, 42, 75, 0.8)";

          setTimeout(() => {
            copyText.style.display = "inline";
            copySuccess.style.display = "none";
            copyBtn.style.borderColor = "";
            copyBtn.style.color = "";
            copyBtn.style.background = "";
            copyBtn.style.boxShadow = "";
          }, 2200);
        }
      }).catch(() => {
        const mailLink = document.getElementById("splitEmailLink");
        if (mailLink) mailLink.click();
      });
    });
  }

  // Backdrop Click to Close
  if (backdrop) {
    backdrop.addEventListener("click", () => {
      if (isMenuOpen) closeMenu();
    });
  }

  // Keyboard Escape
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMenuOpen) {
      closeMenu();
    }
  });
}

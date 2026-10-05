/**
 * services.js — Section Services, Déroulement (Processus), FAQ, Contact & Monumental Footer
 *
 * Fonctionnalités :
 * - Initialisation du canvas WebGL 3D Astral Forge
 * - 3D Card Tilt interactif avec reflets spéculaires dynamiques sur les Pactes
 * - Gestion interactive de l'accordéon FAQ avec GSAP & accessibilité
 * - Liaison fluide entre les boutons des Pactes et le formulaire de contact
 * - Horloge du Sanctuaire en direct et retour au sommet cinématique dans le Footer
 * - Traitement et feedback interactif du formulaire de serment (Contact)
 * - Animations d'apparition séquencée au scroll (ScrollTrigger)
 */

import { initServicesCanvas } from "./services-canvas.js?v=2";

export function initServices() {
  initServicesCanvas();
  initCard3DTilt();
  initFaqAccordion();
  initPactCtaHandlers();
  initContactForm();
  initFooterClockAndScroll();
  initServicesScrollAnimations();
}

/**
 * 1. 3D Card Tilt avec reflet spéculaire au survol
 */
function initCard3DTilt() {
  const cards = document.querySelectorAll(".pact-card");
  if (!cards.length) return;

  cards.forEach((card) => {
    // Créer la couche de brillance spéculaire si absente
    let sheen = card.querySelector(".pact-card-sheen");
    if (!sheen) {
      sheen = document.createElement("div");
      sheen.className = "pact-card-sheen";
      card.appendChild(sheen);
    }

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calcul des angles d'inclinaison (max 10 deg)
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale3d(1.02, 1.02, 1.02)`;

      // Déplacer le reflet de lumière
      const sheenX = (x / rect.width) * 100;
      const sheenY = (y / rect.height) * 100;
      sheen.style.background = `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255, 255, 255, 0.14) 0%, transparent 60%)`;
      sheen.style.opacity = "1";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)";
      sheen.style.opacity = "0";
    });
  });
}

/**
 * 2. Accordéon FAQ (Le Grimoire des Réponses) - Ouverture & Fermeture Ultra-Smooth GSAP
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");
  if (!faqItems.length) return;

  function closePanel(itemToClose) {
    if (!itemToClose.classList.contains("is-open")) return;
    itemToClose.classList.remove("is-open");
    const trig = itemToClose.querySelector(".faq-trigger");
    const pan = itemToClose.querySelector(".faq-answer-panel");
    if (trig) trig.setAttribute("aria-expanded", "false");
    if (!pan) return;

    if (typeof gsap !== "undefined") {
      gsap.killTweensOf(pan);
      gsap.to(pan, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
        onComplete: () => {
          if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
        },
      });
    } else {
      pan.style.height = "0px";
      pan.style.opacity = "0";
    }
  }

  function openPanel(itemToOpen) {
    itemToOpen.classList.add("is-open");
    const trig = itemToOpen.querySelector(".faq-trigger");
    const pan = itemToOpen.querySelector(".faq-answer-panel");
    if (trig) trig.setAttribute("aria-expanded", "true");
    if (!pan) return;

    if (typeof gsap !== "undefined") {
      gsap.killTweensOf(pan);
      // Mesure dynamique de la hauteur du contenu
      pan.style.height = "auto";
      const targetHeight = pan.scrollHeight;
      const startHeight = pan.offsetHeight || 0;
      pan.style.height = startHeight + "px";

      gsap.fromTo(
        pan,
        { height: startHeight, opacity: 0 },
        {
          height: targetHeight,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => {
            pan.style.height = "auto";
            if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
          },
        }
      );
    } else {
      pan.style.height = "auto";
      pan.style.opacity = "1";
    }
  }

  faqItems.forEach((item) => {
    const trigger = item.querySelector(".faq-trigger");
    const panel = item.querySelector(".faq-answer-panel");
    if (!trigger || !panel) return;

    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      // Fermer tous les autres items
      faqItems.forEach((other) => {
        if (other !== item && other.classList.contains("is-open")) {
          closePanel(other);
        }
      });

      if (isOpen) {
        closePanel(item);
      } else {
        openPanel(item);
      }
    });
  });
}

/**
 * 3. Clic sur les boutons des cartes de service -> Scroll & pré-sélection
 */
function initPactCtaHandlers() {
  const pactBtns = document.querySelectorAll(".pact-btn[data-service]");
  const selectEl = document.getElementById("projectType");

  pactBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const serviceVal = btn.getAttribute("data-service");
      if (selectEl && serviceVal) {
        selectEl.value = serviceVal;
      }
    });
  });
}

/**
 * 4. Validation et feedback interactif du Formulaire de Contact
 */
function initContactForm() {
  const form = document.getElementById("contactForm");
  const statusMsg = document.getElementById("formStatusMsg");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("contactName");
    const emailInput = document.getElementById("contactEmail");
    const messageInput = document.getElementById("contactMessage");

    if (!nameInput?.value.trim() || !emailInput?.value.trim() || !messageInput?.value.trim()) {
      alert("Veuillez remplir votre nom, email et message pour prêter serment.");
      return;
    }

    const submitBtn = form.querySelector(".form-submit-btn");
    const originalText = submitBtn ? submitBtn.innerHTML : "";

    if (submitBtn) {
      submitBtn.innerHTML = `<span>Scellement en cours...</span>`;
      submitBtn.style.pointerEvents = "none";
    }

    setTimeout(() => {
      if (statusMsg) {
        statusMsg.classList.add("is-success");
        statusMsg.innerHTML = `✦ Le serment a été scellé avec succès. Votre vision a traversé l'Abysse, vous recevrez une réponse sous 24h.`;
      }

      form.reset();

      if (submitBtn) {
        submitBtn.innerHTML = `<span>✦ Pacte Enregistré</span>`;
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.pointerEvents = "all";
        }, 4000);
      }
    }, 900);
  });
}

/**
 * 5. Horloge du Sanctuaire en direct & Bouton Retour au Sommet (Lenis)
 */
function initFooterClockAndScroll() {
  const clockEl = document.getElementById("sanctuaryClock");
  if (clockEl) {
    function updateClock() {
      const now = new Date();
      // Format 24h avec fuseau heure de Paris / Lordran
      const timeStr = now.toLocaleTimeString("fr-FR", {
        timeZone: "Europe/Paris",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      clockEl.textContent = timeStr;
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  const backToTopBtn = document.getElementById("backToTopBtn");
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.lenis) {
        window.lenis.scrollTo(0, { duration: 2.2 });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }
}

/**
 * 6. Animations ScrollTrigger pour les cartes, timeline et FAQ
 */
function initServicesScrollAnimations() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  // Cartes des Pactes
  const pactCards = document.querySelectorAll(".pact-card");
  if (pactCards.length) {
    gsap.fromTo(
      pactCards,
      { opacity: 0, y: 50, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        stagger: 0.18,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".services-pacts-grid",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );
  }

  // Étapes de la Timeline
  const stepItems = document.querySelectorAll(".process-step-item");
  stepItems.forEach((step, idx) => {
    gsap.fromTo(
      step,
      { opacity: 0, x: -35 },
      {
        opacity: 1,
        x: 0,
        duration: 0.75,
        ease: "power2.out",
        scrollTrigger: {
          trigger: step,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );
  });

  // Accordéon FAQ
  const faqItems = document.querySelectorAll(".faq-item");
  if (faqItems.length) {
    gsap.fromTo(
      faqItems,
      { opacity: 0, y: 25 },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.09,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".faq-accordion",
          start: "top 88%",
          toggleActions: "play none none none",
        },
      }
    );
  }

  // Footer reveal
  const footerMonument = document.querySelector(".footer-monument-brand");
  if (footerMonument) {
    gsap.fromTo(
      footerMonument,
      { opacity: 0, y: 40, letterSpacing: "0.2em" },
      {
        opacity: 0.12,
        y: 0,
        letterSpacing: "0.08em",
        duration: 1.4,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".site-monumental-footer",
          start: "top 90%",
          toggleActions: "play none none none",
        },
      }
    );
  }
}

/**
 * services.js — Section Services, Déroulement (Processus), FAQ & Contact
 *
 * Fonctionnalités :
 * - Gestion interactive de l'accordéon FAQ avec GSAP & accessibilité
 * - Liaison fluide entre les boutons des Pactes de service et le formulaire de contact
 * - Animations d'apparition séquencée au scroll (ScrollTrigger)
 * - Traitement et feedback interactif du formulaire de serment (Contact)
 */

export function initServices() {
  initFaqAccordion();
  initPactCtaHandlers();
  initContactForm();
  initServicesScrollAnimations();
}

/**
 * 1. Accordéon FAQ (Le Grimoire des Réponses)
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const trigger = item.querySelector(".faq-trigger");
    const panel = item.querySelector(".faq-answer-panel");

    if (!trigger || !panel) return;

    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      // Fermer tous les autres items pour un affichage propre
      faqItems.forEach((other) => {
        if (other !== item && other.classList.contains("is-open")) {
          other.classList.remove("is-open");
          const otherTrigger = other.querySelector(".faq-trigger");
          if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
        }
      });

      // Toggle l'élément cliqué
      item.classList.toggle("is-open", !isOpen);
      trigger.setAttribute("aria-expanded", !isOpen ? "true" : "false");
    });
  });
}

/**
 * 2. Clic sur les boutons des cartes de service -> Scroll & pré-sélection
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
 * 3. Validation et feedback interactif du Formulaire de Contact
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
 * 4. Animations ScrollTrigger pour les cartes, étapes du rituel et FAQ
 */
function initServicesScrollAnimations() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  // Cartes des Pactes
  const pactCards = document.querySelectorAll(".pact-card");
  if (pactCards.length) {
    gsap.fromTo(
      pactCards,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
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
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: 0.7,
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
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".faq-accordion",
          start: "top 88%",
          toggleActions: "play none none none",
        },
      }
    );
  }
}

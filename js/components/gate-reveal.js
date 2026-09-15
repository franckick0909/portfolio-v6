/**
 * gate-reveal.js (Threshold Narrative Reveal)
 *
 * Révélation cinématique et fluide du texte du Seuil (Chronique Acte I)
 * sans éléments de porte encombrants ni lag.
 */

export function initGateReveal() {
  const thresholdSection = document.querySelector(".section-threshold");
  const thresholdContent = document.querySelector(".threshold-container");
  if (!thresholdSection || !thresholdContent || typeof gsap === "undefined") return;

  gsap.fromTo(
    thresholdContent,
    {
      opacity: 0,
      y: 40,
      scale: 0.96,
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: thresholdSection,
        start: "top 80%",
        end: "center center",
        scrub: 0.8,
      },
    }
  );
}

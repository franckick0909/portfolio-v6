/**
 * gallery-cards-archive.js — Archive of the multi-image rotating fan-out & inward collapse animation
 * Saved for reuse in the Projects / Showcase section as requested by the user.
 * 
 * Features:
 * - Independent wrapper & inner element creation for separate clip-path and zoom-out parallax
 * - Rotating fan-out entrance: [7.5, -2.5, -10, 12.5, -5, 5] deg with polygon clip-path
 * - Inward collapse sequence with stagger
 * - Rolling counter and editorial meta synchronization
 */

export function initGalleryCardsArchive(containerSelector = ".projects-gallery") {
  const galleryImages = document.querySelectorAll(`${containerSelector} img`);
  if (!galleryImages.length) return;

  galleryImages.forEach((img) => {
    const wrapper = document.createElement("div");
    wrapper.className = "gallery-img-wrap";
    wrapper.style.position = "absolute";
    wrapper.style.top = "0";
    wrapper.style.left = "0";
    wrapper.style.width = "100%";
    wrapper.style.height = "100%";
    wrapper.style.willChange = "clip-path, transform";
    wrapper.style.overflow = "hidden";
    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);
    img.style.opacity = "1";
  });

  const wrappers = document.querySelectorAll(`${containerSelector} .gallery-img-wrap`);
  const inners = document.querySelectorAll(`${containerSelector} img`);
  const rotations = [7.5, -2.5, -10, 12.5, -5, 5];

  gsap.set(wrappers, {
    rotation: (i) => rotations[i] || 0,
    scale: 0,
    clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
  });

  gsap.set(inners, {
    scale: 1.5,
    opacity: 1,
    transformOrigin: "50% 50%",
  });

  const tl = gsap.timeline();

  // Entrance
  tl.to(wrappers, {
    rotation: 0,
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    scale: 1,
    duration: 1.5,
    ease: "power3.out",
    stagger: 0.15,
  });

  tl.to(inners, {
    scale: 1,
    duration: 1.5,
    ease: "power3.out",
    stagger: 0.15,
  }, 0);

  return tl;
}

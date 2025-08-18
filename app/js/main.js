// Main application scripts
/* global Splide */

document.addEventListener("DOMContentLoaded", () => {
  const mainSlider = document.getElementById("main-slider");
  if (mainSlider) {
    new Splide(mainSlider, {
      type: "loop",
      autoplay: true,
      arrows: false,
      pagination: false,
      cover: true,
      heightRatio: 0.5625,
    }).mount();
  }

  const reviewsSlider = document.getElementById("reviews-slider");
  if (reviewsSlider) {
    new Splide(reviewsSlider, {
      type: "loop",
      perPage: 3,
      perMove: 1,
      gap: "1.5rem",
      autoplay: true,
      arrows: false,
      pagination: false,
      pauseOnHover: true,
      breakpoints: {
        900: { perPage: 2 },
        600: { perPage: 1 },
      },
    }).mount();
  }

  // Expand / collapse review bodies
  document.querySelectorAll(".review-card__expand").forEach((btn) => {
    btn.addEventListener("click", () => {
      const body = btn
        .closest(".review-card")
        .querySelector(".review-card__body");
      const full = body.getAttribute("data-full");
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        // collapse
        body.textContent = full.slice(0, 48) + "...";
        btn.textContent = "More";
        btn.setAttribute("aria-expanded", "false");
      } else {
        body.textContent = full;
        btn.textContent = "Less";
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
});

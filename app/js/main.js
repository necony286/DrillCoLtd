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
      breakpoints: { 900: { perPage: 2 }, 600: { perPage: 1 } },
    }).mount();

    // Simple expand/collapse
    reviewsSlider.querySelectorAll(".review-card__expand").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".review-card");
        const body = card.querySelector(".review-card__body");
        const full = body.getAttribute("data-full");
        const collapsed = full.slice(0, 48) + "...";
        const expanding = !card.classList.contains("is-expanded");
        card.classList.toggle("is-expanded", expanding);
        body.textContent = expanding ? full : collapsed;
        btn.textContent = expanding ? "Less" : "More";
        btn.setAttribute("aria-expanded", expanding ? "true" : "false");
      });
    });
  }
});

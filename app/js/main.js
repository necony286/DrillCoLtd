// Main application scripts
/* global Splide */

document.addEventListener("DOMContentLoaded", () => {
  const slider = document.querySelector("#main-slider");
  if (slider) {
    new Splide(slider, {
      type: "loop",
      autoplay: true,
      arrows: false,
      pagination: false,
      cover: true,
    }).mount();
  }
});

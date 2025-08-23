// Main application scripts
/* global Splide */ // removed unused 'google'

document.addEventListener("DOMContentLoaded", () => {
  // Pause autoplay if user prefers reduced motion
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const mainSlider = document.getElementById("main-slider");
  if (mainSlider) {
    new Splide(mainSlider, {
      type: "loop",
      autoplay: !prefersReduced,
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
      autoplay: !prefersReduced,
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

  // Location / Map (data-driven)
  (function initLocation() {
    const loc = document.querySelector(".location-section");
    if (!loc) return;

    const MAP_LAT = parseFloat(loc.dataset.lat);
    const MAP_LNG = parseFloat(loc.dataset.lng);
    const hasCoords = !Number.isNaN(MAP_LAT) && !Number.isNaN(MAP_LNG);

    const MAP_ADDRESS = loc.dataset.address || "";
    const MAP_PHONE = loc.dataset.phone || "";
    const MAP_NAME = loc.dataset.name || "Location";
    const MAP_ZOOM = parseInt(loc.dataset.zoom || "14", 10);
    const MAP_ID = loc.dataset.mapId || "DEMO_MAP_ID"; // NEW: map style id for vector basemap / Advanced Markers

    const addrEl = loc.querySelector("[data-address]"); // scoped (was document.querySelector)
    if (addrEl && MAP_ADDRESS) addrEl.textContent = MAP_ADDRESS;

    const phoneLink = document.querySelector("[data-phone]");
    if (phoneLink && MAP_PHONE) {
      phoneLink.href = "tel:" + MAP_PHONE.replace(/[^\d+]/g, "");
    }

    const copyBtn = document.querySelector("[data-copy-address]");
    if (copyBtn && MAP_ADDRESS) {
      copyBtn.addEventListener("click", async () => {
        const original = copyBtn.textContent;
        try {
          await navigator.clipboard.writeText(MAP_ADDRESS);
          copyBtn.textContent = "Copied!";
        } catch {
          copyBtn.textContent = "Failed";
        }
        setTimeout(() => (copyBtn.textContent = original), 2200);
      });
    }

    if (!hasCoords) {
      // No coordinates: keep static placeholder only
      const consentBtn = document.querySelector("[data-map-consent]");
      if (consentBtn) {
        consentBtn.removeAttribute("data-map-consent");
        consentBtn.type = "button";
        consentBtn.style.cursor = "default";
        consentBtn.querySelector(".location-section__consent-text")?.remove();
      }
      return;
    }

    buildDirectionsLinks(MAP_LAT, MAP_LNG);
    wireMapConsent({
      lat: MAP_LAT,
      lng: MAP_LNG,
      zoom: MAP_ZOOM,
      name: MAP_NAME,
      mapId: MAP_ID, // pass through
    });

    function buildDirectionsLinks(lat, lng) {
      const qs = encodeURIComponent(`${lat},${lng}`);
      const dir = document.querySelector("[data-directions]");
      const open = document.querySelector("[data-open]");
      if (dir)
        dir.href = `https://www.google.com/maps/dir/?api=1&destination=${qs}`;
      if (open) open.href = `https://maps.google.com/?q=${qs}`;
    }

    function wireMapConsent(cfg) {
      const consentBtn = document.querySelector("[data-map-consent]");
      const mapEl = document.querySelector("[data-map]");
      if (!consentBtn || !mapEl) return;

      function loadGoogleScript(cb) {
        if (window.google && window.google.maps) return cb();
        const s = document.createElement("script");
        s.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAYbz3sEBRLZA6InOq9dVJ8ngKKbALPNCc&v=weekly&loading=async&libraries=marker&callback=__initMap";
        s.async = true;
        s.defer = true;
        window.__initMap = cb;
        document.head.appendChild(s);
      }

      function initMap() {
        if (!(window.google && window.google.maps)) return;
        mapEl.hidden = false;

        const map = new window.google.maps.Map(mapEl, {
          center: { lat: cfg.lat, lng: cfg.lng },
          zoom: cfg.zoom,
          clickableIcons: false,
          mapId: cfg.mapId, // NEW: required for AdvancedMarkerElement
        });

        const { AdvancedMarkerElement } = window.google.maps.marker;
        new AdvancedMarkerElement({
          position: { lat: cfg.lat, lng: cfg.lng },
          map,
          title: cfg.name,
        });
      }

      function activate() {
        if (consentBtn.dataset.loaded === "1") return;
        consentBtn.dataset.loaded = "1";
        consentBtn.remove();
        loadGoogleScript(initMap);
        try {
          localStorage.setItem("mapConsent", "1");
        } catch (e) {
          void e;
        }
      }

      consentBtn.addEventListener("click", activate);

      try {
        if (
          localStorage.getItem("mapConsent") === "1" &&
          "IntersectionObserver" in window
        ) {
          const io = new IntersectionObserver(
            (ents) => {
              if

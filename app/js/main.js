// Main application scripts
/* global Splide */ // removed unused 'google'

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

  const MAP_LAT = 37.422; // TODO: replace with real latitude
  const MAP_LNG = -122.084; // TODO: replace with real longitude
  const MAP_ADDRESS = "123 Example Street, City, STATE 12345, Country";
  const MAP_ZOOM = 14;

  const mapWrapper = document.querySelector("[data-map-wrapper]");
  const consentBtn = document.querySelector("[data-map-consent]");
  const mapEl = document.querySelector("[data-map]");
  const addrEl = document.querySelector("[data-address]");
  const copyBtn = document.querySelector("[data-copy-address]");

  if (addrEl) addrEl.textContent = MAP_ADDRESS;

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(MAP_ADDRESS);
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy address"), 2500);
      } catch {
        copyBtn.textContent = "Failed";
        setTimeout(() => (copyBtn.textContent = "Copy address"), 2500);
      }
    });
  }

  function buildDirectionsLinks() {
    const qs = encodeURIComponent(`${MAP_LAT},${MAP_LNG}`);
    const dir = document.querySelector("[data-directions]");
    const open = document.querySelector("[data-open]");
    if (dir)
      dir.href = `https://www.google.com/maps/dir/?api=1&destination=${qs}`;
    if (open) open.href = `https://maps.google.com/?q=${qs}`;
  }
  buildDirectionsLinks();

  function loadGoogleScript(cb) {
    if (window.google && window.google.maps) return cb();
    const s = document.createElement("script");
    s.src =
      "https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=__initMap";
    s.async = true;
    window.__initMap = cb;
    document.head.appendChild(s);
  }

  function initMap() {
    if (!mapEl || !(window.google && window.google.maps)) return;
    mapEl.hidden = false;
    const map = new window.google.maps.Map(mapEl, {
      center: { lat: MAP_LAT, lng: MAP_LNG },
      zoom: MAP_ZOOM,
      mapId: "DEMO_MAP_ID",
      clickableIcons: false,
    });
    new window.google.maps.Marker({
      position: { lat: MAP_LAT, lng: MAP_LNG },
      map,
      title: "DRILL WEED SHOP",
    });
  }

  function activateMap() {
    if (!consentBtn || consentBtn.dataset.loaded === "1") return;
    consentBtn.dataset.loaded = "1";
    consentBtn.remove();
    loadGoogleScript(initMap);
    try {
      localStorage.setItem("mapConsent", "1");
    } catch (e) {
      // Ignore quota / privacy mode errors
      void e;
    }
  }

  if (consentBtn) {
    consentBtn.addEventListener("click", activateMap);
    // Auto-enable if previously consented and scrolled into view
    const prior = (() => {
      try {
        return localStorage.getItem("mapConsent") === "1";
      } catch {
        return false;
      }
    })();
    if (prior && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            activateMap();
            io.disconnect();
          }
        },
        { rootMargin: "0px 0px -20% 0px" }
      );
      io.observe(mapWrapper);
    }
  }

  // Global Age Gate
  (function ageGate() {
    const modal = document.getElementById("age-gate");
    if (!modal) return;

    const KEY = "ageGateVerifiedAt";
    const COOKIE = "ageGate";
    const DAYS = 7;
    const TTL = DAYS * 86400000;
    const now = Date.now();

    const getCookie = (n) =>
      document.cookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith(n + "="))
        ?.split("=")[1];

    const lsStamp = (() => {
      try {
        return localStorage.getItem(KEY);
      } catch {
        return null;
      }
    })();
    const cookieStamp = getCookie(COOKIE);
    const stamp = parseInt(lsStamp || cookieStamp || "0", 10);

    if (stamp && now - stamp < TTL) return; // already verified

    let prevFocus = document.activeElement;
    const yesBtn = modal.querySelector("[data-age-yes]");
    const noBtn = modal.querySelector("[data-age-no]");

    function setVerified() {
      const t = Date.now();
      try {
        localStorage.setItem(KEY, String(t));
      } catch (err) {
        void err; // ignore quota / privacy errors
      }
      document.cookie = `${COOKIE}=${t};path=/;max-age=${TTL / 1000}`;
    }

    function openModal() {
      modal.hidden = false;
      modal.classList.add("is-open");
      document.body.classList.add("is-locked");
      requestAnimationFrame(() => (yesBtn || modal).focus());
      trapFocus();
    }

    function closeModal() {
      modal.classList.remove("is-open");
      document.body.classList.remove("is-locked");
      if (prevFocus && prevFocus.focus) prevFocus.focus();
      setTimeout(() => {
        modal.hidden = true;
      }, 300);
      releaseTrap();
    }

    yesBtn?.addEventListener("click", () => {
      setVerified();
      closeModal();
    });

    noBtn?.addEventListener("click", () => {
      window.location.href = "https://www.google.com";
    });

    // Focus trap
    let trapHandler;
    function trapFocus() {
      const focusables = Array.from(
        modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled"));
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      trapHandler = (e) => {
        if (e.key !== "Tab") return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };
      document.addEventListener("keydown", trapHandler);
    }
    function releaseTrap() {
      if (trapHandler) document.removeEventListener("keydown", trapHandler);
    }

    // Cross‑tab sync
    window.addEventListener("storage", (e) => {
      if (e.key === KEY && e.newValue) {
        const ts = parseInt(e.newValue, 10);
        if (
          ts &&
          Date.now() - ts < TTL &&
          modal.classList.contains("is-open")
        ) {
          closeModal();
        }
      }
    });

    // Defer to next paint
    requestAnimationFrame(openModal);
  })();
});

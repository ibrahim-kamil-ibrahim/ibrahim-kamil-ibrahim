/* ==========================================================================
   Ibrahim Kamil Ibrahim — Portfolio Scripts
   Sections: 1) Theme toggle  2) Mobile nav  3) Scroll-in animations
              4) Contact form (mailto fallback)
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     1) DARK / LIGHT MODE TOGGLE
     Preference is remembered in localStorage. Falls back to the visitor's
     OS preference on first visit.
  ------------------------------------------------------------------------ */
  var root = document.documentElement;
  var themeToggle = document.getElementById("theme-toggle");
  var STORAGE_KEY = "ikib-theme";

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeToggle) {
      var isLight = theme === "light";
      themeToggle.setAttribute("aria-pressed", String(isLight));
      themeToggle.setAttribute(
        "aria-label",
        isLight ? "Switch to dark mode" : "Switch to light mode"
      );
    }
  }

  function getInitialTheme() {
    var stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      /* localStorage unavailable (privacy mode, etc.) — ignore */
    }
    if (stored === "light" || stored === "dark") return stored;

    var prefersLight =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches;
    return prefersLight ? "light" : "dark";
  }

  applyTheme(getInitialTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      var next = current === "light" ? "dark" : "light";
      applyTheme(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (e) {
        /* ignore write failures */
      }
    });
  }

  /* ------------------------------------------------------------------------
     2) MOBILE HAMBURGER MENU
  ------------------------------------------------------------------------ */
  var navToggle = document.getElementById("nav-toggle");
  var navMenu = document.getElementById("nav-menu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var isOpen = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  /* ------------------------------------------------------------------------
     3) FADE-IN ON SCROLL
     Any element with [data-animate] fades/slides in once it enters the
     viewport. Uses IntersectionObserver; falls back gracefully if missing.
  ------------------------------------------------------------------------ */
  var animatedEls = document.querySelectorAll("[data-animate]");

  if ("IntersectionObserver" in window && animatedEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    animatedEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    animatedEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ------------------------------------------------------------------------
     4) CONTACT FORM — mailto: fallback
     This is a static site with no backend, so submitting opens the
     visitor's email client with the message pre-filled.

     To use a real form service instead (Formspree, Getform, Web3Forms, etc):
       1. Set the <form> element's action="YOUR_ENDPOINT_URL" and method="POST"
          in index.html.
       2. Remove or adjust the preventDefault()/mailto logic below so the
          form submits normally to that endpoint.
  ------------------------------------------------------------------------ */
  var CONTACT_EMAIL = "REPLACE_WITH_EMAIL@example.com"; // <-- REPLACE with a real email address

  var form = document.getElementById("contact-form");
  var formNote = document.getElementById("form-note");

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();

      if (!name || !email || !message) {
        if (formNote) formNote.textContent = "Please fill in every field before sending.";
        return;
      }

      var subject = encodeURIComponent("Portfolio contact from " + name);
      var body = encodeURIComponent(
        message + "\n\n— " + name + " (" + email + ")"
      );

      window.location.href =
        "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;

      if (formNote) {
        formNote.textContent = "Opening your email app to send this message…";
      }
    });
  }
})();

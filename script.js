/* ==========================================================================
   Ibrahim Kamil Ibrahim — Portfolio Scripts  (Modern UI/UX Edition)
   Sections:
     1) Theme toggle (dark/light, persisted in localStorage)
     2) Mobile nav toggle (hamburger)
     3) Scroll effects (progress bar, glassmorphism, active link)
     4) Intersection Observer for scroll-triggered animations
     5) Smooth reveal helpers
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

  function getSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (_) { return null; }
  }

  function saveTheme(theme) {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
  }

  // Apply saved theme, or fall back to OS preference
  (function initTheme() {
    var saved = getSavedTheme();
    if (saved === "light" || saved === "dark") {
      applyTheme(saved);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      applyTheme("light");
    } else {
      applyTheme("dark");
    }
  })();

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") || "dark";
      var next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      saveTheme(next);
    });
  }

  // Sync with OS changes if no saved preference
  if (window.matchMedia) {
    try {
      var mq = window.matchMedia("(prefers-color-scheme: light)");
      mq.addEventListener("change", function (e) {
        if (!getSavedTheme()) {
          applyTheme(e.matches ? "light" : "dark");
        }
      });
    } catch (_) {}
  }

  /* ------------------------------------------------------------------------
     2) MOBILE NAV TOGGLE
  ------------------------------------------------------------------------ */
  var navToggle = document.getElementById("nav-toggle");
  var navMenu = document.getElementById("nav-menu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var isOpen = navMenu.classList.toggle("open");
      navToggle.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close menu when a nav link is clicked
    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navMenu.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navMenu.classList.contains("open")) {
        navMenu.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.focus();
      }
    });
  }

  /* ------------------------------------------------------------------------
     3) SCROLL EFFECTS
        - Progress bar at top of page
        - Navbar glassmorphism after scrolling past threshold
        - Active nav link based on scroll position
  ------------------------------------------------------------------------ */
  var siteHeader = document.querySelector(".site-header");
  var navProgress = document.createElement("div");
  navProgress.className = "nav-progress";
  document.body.appendChild(navProgress);

  var navLinks = siteHeader
    ? Array.prototype.slice.call(
        siteHeader.querySelectorAll(".nav-menu a[href^='#']")
      )
    : [];

  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href").slice(1);
      var el = document.getElementById(id);
      return el ? { id: id, el: el, link: link } : null;
    })
    .filter(Boolean);

  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var scrollY = window.scrollY || document.documentElement.scrollTop;
      var docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

      // Progress bar
      navProgress.style.width = Math.min(progress, 100) + "%";

      // Glassmorphism header
      if (siteHeader) {
        if (scrollY > 40) {
          siteHeader.classList.add("scrolled");
        } else {
          siteHeader.classList.remove("scrolled");
        }
      }

      // Active nav link
      if (sections.length) {
        var currentId = null;
        for (var i = 0; i < sections.length; i++) {
          var section = sections[i];
          var offset = section.el.getBoundingClientRect().top + scrollY - 120;
          if (scrollY >= offset - 200) {
            currentId = section.id;
          }
        }
        // Fallback: if near the top, use first section
        if (!currentId && scrollY < 300 && sections.length) {
          currentId = sections[0].id;
        }
        navLinks.forEach(function (link) {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === "#" + currentId
          );
        });
      }

      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  // Run once to set initial state
  onScroll();

  /* ------------------------------------------------------------------------
     4) INTERSECTION OBSERVER — scroll-triggered animations
     Elements with [data-animate] get a .visible class when they enter
     the viewport.  Delaying is handled via CSS transition-delay.
  ------------------------------------------------------------------------ */
  if ("IntersectionObserver" in window) {
    var animateSelector = '[data-animate]';
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            // Optionally unobserve after reveal for performance
            // observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    document.querySelectorAll(animateSelector).forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show everything immediately
    document.querySelectorAll(animateSelector).forEach(function (el) {
      el.classList.add("visible");
    });
  }

  /* ------------------------------------------------------------------------
     5) SMOOTH REVEAL — helper for any dynamically added content
  ------------------------------------------------------------------------ */
  function reveal(el) {
    if (el && el.classList.contains("visible")) return;
    if (el) el.classList.add("visible");
  }

  /* ------------------------------------------------------------------------
     6) CONTACT FORM — mailto: fallback
     Replace CONTACT_EMAIL below with the real address once ready.
     For production, wire up a form service (Formspree, Getform, etc.)
     and remove the mailto fallback.
  ------------------------------------------------------------------------ */
  var CONTACT_EMAIL = "ibrahim.kamil@example.com"; // TODO: replace with real email

  var contactForm = document.getElementById("contact-form");
  var formNote = document.getElementById("form-note");

  if (contactForm && formNote) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var nameEl = document.getElementById("name");
      var emailEl = document.getElementById("email");
      var messageEl = document.getElementById("message");

      var name = (nameEl && nameEl.value.trim()) || "";
      var email = (emailEl && emailEl.value.trim()) || "";
      var message = (messageEl && messageEl.value.trim()) || "";

      if (!name || !email || !message) {
        formNote.textContent = "Please fill in all fields.";
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        formNote.textContent = "Please enter a valid email address.";
        return;
      }

      // Build mailto link
      var subject = "Portfolio contact from " + encodeURIComponent(name);
      var body =
        "Name: " +
        encodeURIComponent(name) +
        "\nEmail: " +
        encodeURIComponent(email) +
        "\n\n" +
        encodeURIComponent(message);
      var mailto = "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;

      window.location.href = mailto;

      formNote.textContent = "Opening your email client...";
      contactForm.reset();
    });
  }

  /* ------------------------------------------------------------------------
     7) KEYBOARD NAVIGATION — make the site header friendlier
  ------------------------------------------------------------------------ */
  // Close mobile nav on click outside
  document.addEventListener("click", function (e) {
    if (navMenu && navMenu.classList.contains("open")) {
      if (
        !navMenu.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        navMenu.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    }
  });

  /* ------------------------------------------------------------------------
     8) LAZY LOADING ENHANCEMENT — native loading="lazy" is already set;
        this is just a safety net for older browsers.
  ------------------------------------------------------------------------ */
  if ("loading" in HTMLImageElement.prototype) {
    // Native lazy loading supported
  } else {
    // Polyfill: load images with data-src on scroll
    var lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if ("IntersectionObserver" in window) {
      var lazyObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var img = entry.target;
            var src = img.getAttribute("data-src");
            if (src) {
              img.src = src;
              img.removeAttribute("data-src");
            }
            lazyObserver.unobserve(img);
          }
        });
      });
      lazyImages.forEach(function (img) {
        if (img.getAttribute("data-src")) {
          lazyObserver.observe(img);
        }
      });
    }
  }

})();

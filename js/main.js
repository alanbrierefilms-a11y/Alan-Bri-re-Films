document.addEventListener("DOMContentLoaded", () => {
  /* Header background on scroll */
  const header = document.querySelector(".site-header");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile nav toggle */
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (toggle && navLinks) {
    toggle.addEventListener("click", () => {
      navLinks.classList.toggle("is-open");
      document.body.classList.toggle("nav-open");
    });
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        document.body.classList.remove("nav-open");
      });
    });
  }

  /* Reveal on scroll (progressive enhancement — html.js-reveal set in <head>) */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));
    // Safety net: never leave content permanently hidden.
    setTimeout(() => {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }, 2500);
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* Showreel play button placeholder */
  document.querySelectorAll(".player-play").forEach((btn) => {
    btn.addEventListener("click", () => {
      alert(
        "Emplacement du showreel.\n\nRemplacez ce bloc par une vidéo (YouTube, Vimeo ou fichier MP4) dans le fichier HTML correspondant."
      );
    });
  });

  /* Film filter (films.html) */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const filmCards = document.querySelectorAll("[data-category]");
  if (filterBtns.length && filmCards.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const cat = btn.dataset.filter;
        filmCards.forEach((card) => {
          const show = cat === "all" || card.dataset.category === cat;
          card.style.display = show ? "" : "none";
        });
      });
    });
  }

  /* Contact form: static demo submit */
  const form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.textContent = "Message envoyé";
      btn.disabled = true;
      form.reset();
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 3000);
    });
  }

  /* Footer year */
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

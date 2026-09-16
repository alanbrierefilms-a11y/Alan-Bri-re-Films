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

  /* Lecture de la vidéo au clic (fichier local indiqué par data-video) */
  document.querySelectorAll(".player-play").forEach((btn) => {
    btn.addEventListener("click", () => {
      const player = btn.closest(".player");
      const src = player && player.dataset.video;

      if (!src) {
        alert(
          "Emplacement du showreel.\n\nRemplacez ce bloc par une vidéo (YouTube, Vimeo ou fichier MP4) dans le fichier HTML correspondant."
        );
        return;
      }

      const video = document.createElement("video");
      video.src = src;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.style.width = "100%";
      video.style.height = "100%";
      video.style.objectFit = "cover";

      video.addEventListener("error", () => {
        player.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-faint);font-size:13px;text-align:center;padding:20px;">Vidéo introuvable — déposez le fichier à l\'emplacement&nbsp;<strong>' +
          src +
          "</strong></div>";
      });

      player.innerHTML = "";
      player.appendChild(video);
    });
  });

  /* Bloc "Pourquoi travailler avec moi" : la liste numérotée reste fixe,
     le texte défile et met en avant l'étape active (façon scrollytelling) */
  const advSteps = document.querySelectorAll(".advantages-step");
  const advNavItems = document.querySelectorAll(".advantages-nav-item");
  if (advSteps.length && advNavItems.length) {
    advNavItems.forEach((btn) => {
      btn.addEventListener("click", () => {
        const step = document.querySelector(
          `.advantages-step[data-step="${btn.dataset.step}"]`
        );
        if (step) step.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });

    if ("IntersectionObserver" in window) {
      const advObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const step = entry.target.dataset.step;
              advSteps.forEach((s) => s.classList.remove("is-active"));
              advNavItems.forEach((n) => n.classList.remove("is-active"));
              entry.target.classList.add("is-active");
              const nav = document.querySelector(
                `.advantages-nav-item[data-step="${step}"]`
              );
              if (nav) nav.classList.add("is-active");
            }
          });
        },
        { threshold: 0.5 }
      );
      advSteps.forEach((s) => advObserver.observe(s));
    }
  }

  /* Carrousel "Une vidéo pour chaque univers" : bande horizontale, navigation par boutons, boucle infinie */
  const prestationTrack = document.querySelector(".prestation-track");
  const prestationPrev = document.querySelector(".prestation-prev");
  const prestationNext = document.querySelector(".prestation-next");
  if (prestationTrack && prestationPrev && prestationNext) {
    const PREPEND = 3;
    const REAL_COUNT = 11;
    const FORWARD_RESET_AT = PREPEND + REAL_COUNT; // 14
    const FORWARD_RESET_TO = PREPEND; // 3
    const BACKWARD_RESET_AT = 0;
    const BACKWARD_RESET_TO = REAL_COUNT; // 11

    let index = PREPEND;

    const stepWidth = () => {
      const first = prestationTrack.children[0];
      const style = getComputedStyle(prestationTrack);
      const gap = parseFloat(style.columnGap || style.gap || "20");
      return first.getBoundingClientRect().width + gap;
    };

    const goTo = (i, animate) => {
      prestationTrack.classList.toggle("no-transition", !animate);
      prestationTrack.style.transform = `translateX(-${i * stepWidth()}px)`;
    };

    goTo(index, false);

    prestationTrack.addEventListener("transitionend", () => {
      if (index === FORWARD_RESET_AT) {
        index = FORWARD_RESET_TO;
        goTo(index, false);
      } else if (index === BACKWARD_RESET_AT) {
        index = BACKWARD_RESET_TO;
        goTo(index, false);
      }
    });

    prestationNext.addEventListener("click", () => {
      index += 1;
      goTo(index, true);
    });

    prestationPrev.addEventListener("click", () => {
      index -= 1;
      goTo(index, true);
    });

    window.addEventListener("resize", () => goTo(index, false));
  }

  /* Grille "réalisations" : colonnes en parallaxe (une monte, une descend) */
  const portfolioGrid = document.querySelector(".portfolio-grid");
  if (portfolioGrid) {
    const upCols = document.querySelectorAll(".portfolio-col-up");
    const downCols = document.querySelectorAll(".portfolio-col-down");

    let portfolioTicking = false;
    const updatePortfolio = () => {
      portfolioTicking = false;
      const vh = window.innerHeight;

      if (window.innerWidth > 780) {
        const rect = portfolioGrid.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
        const shift = (progress - 0.5) * 130;
        upCols.forEach((col) => {
          col.style.transform = `translateY(${40 - shift}px)`;
        });
        downCols.forEach((col) => {
          col.style.transform = `translateY(${-40 + shift}px)`;
        });
      }

    };

    window.addEventListener(
      "scroll",
      () => {
        if (!portfolioTicking) {
          portfolioTicking = true;
          requestAnimationFrame(updatePortfolio);
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", updatePortfolio);
    updatePortfolio();
  }

  /* Badge qui change de mot à l'infini ("Je suis vidéaste / monteur vidéo / pilote de drone") */
  document.querySelectorAll(".cycle-badge").forEach((badge) => {
    const words = (badge.dataset.words || "").split(",").map((w) => w.trim()).filter(Boolean);
    if (words.length < 2) return;
    let i = 0;
    setInterval(() => {
      badge.classList.add("is-swapping");
      setTimeout(() => {
        i = (i + 1) % words.length;
        badge.textContent = words[i];
        badge.classList.remove("is-swapping");
      }, 150);
    }, 1100);
  });

  /* Compteurs animés (chiffres qui s'incrémentent à l'affichage) */
  const counters = document.querySelectorAll("[data-count-to]");
  if (counters.length) {
    const animateCounter = (el) => {
      const target = parseInt(el.dataset.countTo, 10);
      const prefix = el.dataset.prefix || "";
      const suffix = el.dataset.suffix || "";
      const duration = 1200;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = prefix + Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ("IntersectionObserver" in window) {
      const counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              counterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach((el) => counterObserver.observe(el));
    } else {
      counters.forEach((el) => animateCounter(el));
    }
  }

  /* Badges Entreprises / Particuliers : affichent le bandeau de prestations correspondant */
  const audienceTags = document.querySelectorAll(".audience-tag");
  const audienceMarquees = document.querySelectorAll(".audience-marquee");
  audienceTags.forEach((tag) => {
    tag.addEventListener("click", () => {
      const wasActive = tag.classList.contains("is-active");
      audienceTags.forEach((t) => t.classList.remove("is-active"));
      audienceMarquees.forEach((m) => m.classList.remove("is-active"));
      if (!wasActive) {
        tag.classList.add("is-active");
        const target = document.querySelector(
          `.audience-marquee[data-audience="${tag.dataset.audience}"]`
        );
        if (target) target.classList.add("is-active");
      }
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

  /* Formulaires (devis, contact, accueil) : envoi réel via Web3Forms */
  document.querySelectorAll(".contact-form").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Envoi en cours…";

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        const result = await response.json();
        if (result.success) {
          btn.textContent = "Message envoyé";
          form.reset();
        } else {
          throw new Error(result.message || "Échec de l'envoi");
        }
      } catch (err) {
        btn.textContent = "Erreur — réessayez";
      }

      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 4000);
    });
  });

  /* Footer year */
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

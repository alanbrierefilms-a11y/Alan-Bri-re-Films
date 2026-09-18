document.addEventListener("DOMContentLoaded", () => {
  /* Vidéo de présentation : lecture dès qu'elle est visible à l'écran (scroll), pause sinon — ordinateur et téléphone */
  const presentationVideo = document.querySelector(".phone-screen-video");
  if (presentationVideo && "IntersectionObserver" in window) {
    const presentationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            presentationVideo.play().catch(() => {});
          } else {
            presentationVideo.pause();
          }
        });
      },
      { threshold: 0.5 }
    );
    presentationObserver.observe(presentationVideo);
  }

  /* Bandeau d'annonces : un texte à la fois, en fondu */
  const tickerItem = document.querySelector(".site-ticker .ticker-item");
  if (tickerItem) {
    const messages = (tickerItem.dataset.words || "")
      .split(",")
      .map((w) => w.trim())
      .filter(Boolean);
    if (messages.length > 1) {
      let tickerIndex = 0;
      setInterval(() => {
        tickerItem.classList.add("is-swapping");
        setTimeout(() => {
          tickerIndex = (tickerIndex + 1) % messages.length;
          tickerItem.textContent = messages[tickerIndex];
          tickerItem.classList.remove("is-swapping");
        }, 300);
      }, 3200);
    }
  }

  /* FAQ : n'affiche que les 3 premières questions, un bouton "+" révèle les autres */
  const faqList = document.querySelector(".faq-list");
  const faqMoreBtn = document.querySelector(".faq-more-btn");
  if (faqList && faqMoreBtn) {
    faqMoreBtn.addEventListener("click", () => {
      const expanded = faqList.classList.toggle("is-expanded");
      faqMoreBtn.classList.toggle("is-open", expanded);
      faqMoreBtn.querySelector(".faq-more-label").textContent = expanded
        ? "Voir moins de questions"
        : "Voir plus de questions";
    });
  }

  /* Carrousels tactiles (services, étapes) : points de pagination synchronisés au scroll */
  document.querySelectorAll(".scroll-dots").forEach((dotsEl) => {
    const track = document.querySelector(`.${dotsEl.dataset.for}`);
    const dots = dotsEl.querySelectorAll(".scroll-dot");
    if (!track || !dots.length) return;
    let ticking = false;
    const updateDots = () => {
      ticking = false;
      const items = track.children;
      if (!items.length) return;
      const cardWidth = items[0].getBoundingClientRect().width + 16;
      const index = Math.min(dots.length - 1, Math.round(track.scrollLeft / cardWidth));
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    };
    track.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateDots);
        }
      },
      { passive: true }
    );
  });

  /* Avis clients : sur mobile, un seul avis visible à la fois, navigation par flèches */
  const testimonialCards = document.querySelectorAll(".testimonial-card");
  const testimonialDots = document.querySelectorAll(".testimonial-dot");
  const testimonialPrev = document.querySelector(".testimonial-prev");
  const testimonialNext = document.querySelector(".testimonial-next");
  if (testimonialCards.length && testimonialPrev && testimonialNext) {
    let testimonialIndex = 0;
    const showTestimonial = (index) => {
      testimonialIndex = (index + testimonialCards.length) % testimonialCards.length;
      testimonialCards.forEach((card, i) => card.classList.toggle("is-active", i === testimonialIndex));
      testimonialDots.forEach((dot, i) => dot.classList.toggle("is-active", i === testimonialIndex));
    };
    testimonialPrev.addEventListener("click", () => showTestimonial(testimonialIndex - 1));
    testimonialNext.addEventListener("click", () => showTestimonial(testimonialIndex + 1));
  }

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
     le texte défile et met en avant l'étape active en fondu (façon scrollytelling) */
  const advSteps = document.querySelectorAll(".advantages-step");
  const advNavItems = document.querySelectorAll(".advantages-nav-item");
  if (advSteps.length && advNavItems.length) {
    advNavItems.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (window.innerWidth <= 880) {
          const wasOpen = btn.classList.contains("is-open");
          advNavItems.forEach((n) => n.classList.remove("is-open", "is-active"));
          btn.classList.toggle("is-open", !wasOpen);
          btn.classList.toggle("is-active", !wasOpen);
          return;
        }
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

  /* Grille "réalisations" : colonnes en parallaxe (une monte, une descend) */
  const portfolioGrid = document.querySelector(".portfolio-grid");
  if (portfolioGrid) {
    const upCols = document.querySelectorAll(".portfolio-col-up");
    const downCols = document.querySelectorAll(".portfolio-col-down");

    let portfolioTicking = false;
    const updatePortfolio = () => {
      portfolioTicking = false;
      if (window.innerWidth <= 780) {
        upCols.forEach((col) => { col.style.transform = ""; });
        downCols.forEach((col) => { col.style.transform = ""; });
        return;
      }
      const vh = window.innerHeight;

      const rect = portfolioGrid.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
      const shift = (progress - 0.5) * 130;
      upCols.forEach((col) => {
        col.style.transform = `translateY(${40 - shift}px)`;
      });
      downCols.forEach((col) => {
        col.style.transform = `translateY(${-40 + shift}px)`;
      });
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

  /* Photo devant la vidéo "Je suis vidéaste" : glisse vers le texte et disparaît en fondu au scroll */
  const mediaStack = document.querySelector(".media-stack");
  const stackPhoto = document.querySelector(".stack-photo");
  if (mediaStack && stackPhoto) {
    let stackTicking = false;
    const updateStackPhoto = () => {
      stackTicking = false;
      const rect = mediaStack.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const end = vh * 0.15;
      const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
      const shiftX = -120 * progress;
      const shiftY = 30 * progress;
      const rotate = -6 - 10 * progress;
      stackPhoto.style.transform = `translate(${shiftX}px, ${shiftY}px) rotate(${rotate}deg)`;
      stackPhoto.style.opacity = 1 - progress;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!stackTicking) {
          stackTicking = true;
          requestAnimationFrame(updateStackPhoto);
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", updateStackPhoto);
    updateStackPhoto();
  }

  /* Logos clients : deux logos passent en couleur par ligne, puis deux autres, à l'infini */
  document.querySelectorAll(".clients-marquee-section .marquee-track").forEach((track) => {
    const imgs = Array.from(track.children);
    const half = Math.floor(imgs.length / 2);
    if (half < 2) return;
    const step = Math.floor(half / 2) || 1;
    let spotlightIndex = 0;
    setInterval(() => {
      imgs.forEach((img) => img.classList.remove("is-spotlight"));
      [spotlightIndex, (spotlightIndex + step) % half].forEach((i) => {
        imgs[i].classList.add("is-spotlight");
        if (imgs[i + half]) imgs[i + half].classList.add("is-spotlight");
      });
      spotlightIndex = (spotlightIndex + 1) % half;
    }, 900);
  });

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

  /* Onglets Prestations (Vidéo / Drone / Photo) : affichent la liste correspondante */
  const prestationTabsWrap = document.querySelector(".prestation-tabs");
  const prestationTabs = document.querySelectorAll(".prestation-tab");
  const prestationPanels = document.querySelectorAll(".prestation-panel");
  prestationTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      prestationTabs.forEach((t) => t.classList.remove("is-active"));
      prestationPanels.forEach((p) => p.classList.remove("is-active"));
      tab.classList.add("is-active");
      if (prestationTabsWrap) prestationTabsWrap.dataset.active = tab.dataset.tab;
      const target = document.querySelector(
        `.prestation-panel[data-panel="${tab.dataset.tab}"]`
      );
      if (target) target.classList.add("is-active");
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

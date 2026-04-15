const THEME_KEY = "portfolio-theme";

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    const icon = button.querySelector("i");
    const isDark = theme === "dark";
    const nextLabel = isDark ? "Ativar modo claro" : "Ativar modo escuro";

    button.setAttribute("aria-label", nextLabel);
    button.setAttribute("title", nextLabel);

    if (icon) {
      icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
  });
}

applyTheme(getStoredTheme());

const normalizeText = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const showToast = (() => {
  let stack = null;

  return (message, variant = "info") => {
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "toast-stack";
      document.body.appendChild(stack);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast--${variant}`;
    toast.textContent = message;
    stack.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("is-visible");
    });

    window.setTimeout(() => {
      toast.classList.remove("is-visible");
      toast.addEventListener(
        "transitionend",
        () => {
          toast.remove();
        },
        { once: true },
      );
    }, 2600);
  };
})();

function initCurrentYear() {
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
}

function initThemeToggle() {
  const actionsGroups = [...document.querySelectorAll(".nav-actions")];

  if (!actionsGroups.length) {
    return;
  }

  actionsGroups.forEach((actions) => {
    if (actions.querySelector("[data-theme-toggle]")) {
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "nav-icon-btn nav-theme-btn";
    button.dataset.themeToggle = "true";
    button.innerHTML =
      '<i class="fa-solid fa-sun" aria-hidden="true"></i><span class="sr-only">Alternar tema</span>';
    actions.appendChild(button);
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-theme-toggle]");

    if (!trigger) {
      return;
    }

    const nextTheme =
      document.documentElement.dataset.theme === "light" ? "dark" : "light";

    try {
      localStorage.setItem(THEME_KEY, nextTheme);
    } catch {
      /* noop */
    }

    applyTheme(nextTheme);
    showToast(
      nextTheme === "light" ? "Modo claro ativado" : "Modo escuro ativado",
      "success",
    );
  });

  applyTheme(document.documentElement.dataset.theme || "dark");
}

function initScrollProgress() {
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.appendChild(progress);

  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const amount = scrollable > 0 ? window.scrollY / scrollable : 0;
    progress.style.setProperty("--scroll-progress", String(amount));
  };

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
}

function initBackToTop() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "back-to-top";
  button.setAttribute("aria-label", "Voltar para o topo");
  button.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
  document.body.appendChild(button);

  const toggleButton = () => {
    button.classList.toggle("is-visible", window.scrollY > 420);
  };

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  toggleButton();
  window.addEventListener("scroll", toggleButton, { passive: true });
}

function initRevealAnimations() {
  const selectorGroups = [
    ".hero",
    ".hero-copy",
    ".hero-panel",
    ".metric-card",
    ".feature-card",
    ".about-hero",
    ".page-hero__inner",
    ".about-grid > *",
    ".principle-card",
    ".svc-carousel",
    ".skill-bubble",
    ".process-card",
    ".proj-card",
    ".contact-card",
    ".contact-form-layout > *",
  ];

  const elements = [
    ...new Set(
      selectorGroups.flatMap((selector) => [...document.querySelectorAll(selector)]),
    ),
  ];

  if (!elements.length) {
    return;
  }

  elements.forEach((element, index) => {
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay", `${(index % 6) * 70}ms`);
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16 },
  );

  elements.forEach((element) => observer.observe(element));
}

function initRoleRotator() {
  const rotator = document.querySelector("[data-rotate]");

  if (!rotator) {
    return;
  }

  let items = [];

  try {
    items = JSON.parse(rotator.dataset.rotate || "[]");
  } catch {
    items = (rotator.dataset.rotate || "").split("|");
  }

  if (!items.length) {
    return;
  }

  let activeIndex = 0;
  rotator.textContent = items[activeIndex];

  if (items.length < 2 || prefersReducedMotion) {
    return;
  }

  window.setInterval(() => {
    activeIndex = (activeIndex + 1) % items.length;
    rotator.classList.add("is-swapping");

    window.setTimeout(() => {
      rotator.textContent = items[activeIndex];
      rotator.classList.remove("is-swapping");
    }, 180);
  }, 2800);
}

function initMetricCounters() {
  const counters = [...document.querySelectorAll("[data-target]")];

  if (!counters.length) {
    return;
  }

  const animateCounter = (counter) => {
    if (counter.dataset.counted === "true") {
      return;
    }

    const target = Number(counter.dataset.target || 0);
    const suffix = counter.dataset.suffix || "";
    const prefix = counter.dataset.prefix || "";

    counter.dataset.counted = "true";

    if (prefersReducedMotion) {
      counter.textContent = `${prefix}${target}${suffix}`;
      return;
    }

    const duration = 1200;
    const start = performance.now();

    const updateValue = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);

      counter.textContent = `${prefix}${value}${suffix}`;

      if (progress < 1) {
        window.requestAnimationFrame(updateValue);
      }
    };

    counter.textContent = `${prefix}0${suffix}`;
    window.requestAnimationFrame(updateValue);
  };

  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 },
  );

  counters.forEach((counter) => observer.observe(counter));
}

function initServiceCarousel() {
  const carousel = document.querySelector(".svc-carousel");

  if (!carousel) {
    return;
  }

  const slides = [...carousel.querySelectorAll(".svc-slide-toggle")];
  const current = carousel.querySelector("[data-svc-current]");
  const total = carousel.querySelector("[data-svc-total]");
  const prev = carousel.querySelector('[data-svc-direction="prev"]');
  const next = carousel.querySelector('[data-svc-direction="next"]');

  if (!slides.length) {
    return;
  }

  let activeIndex = slides.findIndex((slide) => slide.checked);
  let timerId = null;

  if (activeIndex < 0) {
    activeIndex = 0;
  }

  const updateState = () => {
    slides[activeIndex].checked = true;
    if (current) {
      current.textContent = String(activeIndex + 1).padStart(2, "0");
    }
    if (total) {
      total.textContent = String(slides.length).padStart(2, "0");
    }
  };

  const goTo = (nextIndex) => {
    activeIndex = (nextIndex + slides.length) % slides.length;
    updateState();
  };

  const stopAuto = () => {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  };

  const startAuto = () => {
    if (prefersReducedMotion || slides.length < 2) {
      return;
    }

    stopAuto();
    timerId = window.setInterval(() => {
      goTo(activeIndex + 1);
    }, 5500);
  };

  prev?.addEventListener("click", () => {
    goTo(activeIndex - 1);
    startAuto();
  });

  next?.addEventListener("click", () => {
    goTo(activeIndex + 1);
    startAuto();
  });

  slides.forEach((slide, index) => {
    slide.addEventListener("change", () => {
      activeIndex = index;
      updateState();
      startAuto();
    });
  });

  carousel.addEventListener("mouseenter", stopAuto);
  carousel.addEventListener("mouseleave", startAuto);
  carousel.addEventListener("focusin", stopAuto);
  carousel.addEventListener("focusout", startAuto);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAuto();
      return;
    }

    startAuto();
  });

  updateState();
  startAuto();
}

function initPortfolioFilters() {
  const searchInput = document.querySelector("#portfolio-search");
  const cards = [...document.querySelectorAll(".proj-card")];

  if (!searchInput || !cards.length) {
    return;
  }

  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  const resultsText = document.querySelector("[data-results-text]");
  const emptyState = document.querySelector(".portfolio-empty");
  const resetButton = document.querySelector("[data-reset-filters]");

  cards.forEach((card) => {
    card.dataset.search = normalizeText(card.textContent || "");
  });

  let activeFilter = "all";

  const updateResults = () => {
    const query = normalizeText(searchInput.value);
    let visibleCount = 0;

    cards.forEach((card) => {
      const categories = (card.dataset.categories || "").split(/\s+/).filter(Boolean);
      const matchesFilter =
        activeFilter === "all" || categories.includes(activeFilter);
      const matchesQuery = !query || (card.dataset.search || "").includes(query);
      const isVisible = matchesFilter && matchesQuery;

      card.hidden = !isVisible;
      card.classList.toggle("is-hidden", !isVisible);

      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (resultsText) {
      resultsText.textContent =
        visibleCount === cards.length
          ? `Mostrando todos os ${cards.length} projetos`
          : `Mostrando ${visibleCount} de ${cards.length} projetos`;
    }

    if (emptyState) {
      emptyState.hidden = visibleCount > 0;
    }
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter || "all";

      filterButtons.forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });

      updateResults();
    });
  });

  searchInput.addEventListener("input", updateResults);

  resetButton?.addEventListener("click", () => {
    activeFilter = "all";
    searchInput.value = "";
    filterButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.filter === "all");
    });
    updateResults();
  });

  updateResults();
}

function initCopyButtons() {
  const copyButtons = [...document.querySelectorAll("[data-copy]")];

  if (!copyButtons.length) {
    return;
  }

  const copyText = async (value) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const helper = document.createElement("textarea");
    helper.value = value;
    helper.setAttribute("readonly", "");
    helper.style.position = "absolute";
    helper.style.left = "-9999px";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
  };

  copyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await copyText(button.dataset.copy || "");
        showToast(button.dataset.copySuccess || "Copiado com sucesso", "success");
      } catch {
        showToast("Não foi possível copiar agora", "error");
      }
    });
  });
}

function initContactForm() {
  const form = document.querySelector("#contact-form");

  if (!form) {
    return;
  }

  const nameField = form.querySelector("#nome");
  const emailField = form.querySelector("#email");
  const messageField = form.querySelector("#mensagem");
  const feedback = form.querySelector(".form-feedback");
  const draftKey = "portfolio-contact-draft";
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const setFeedback = (message, isSuccess = false) => {
    if (!feedback) {
      return;
    }

    feedback.textContent = message;
    feedback.classList.toggle("is-success", isSuccess);
  };

  const setFieldError = (field, message) => {
    if (!field) {
      return;
    }

    if (message) {
      field.setAttribute("aria-invalid", "true");
    } else {
      field.removeAttribute("aria-invalid");
    }
  };

  const validateField = (field) => {
    if (!field) {
      return "";
    }

    if (field === nameField) {
      return field.value.trim().length < 2
        ? "Digite um nome com pelo menos 2 caracteres."
        : "";
    }

    if (field === emailField) {
      return !emailPattern.test(field.value.trim())
        ? "Digite um e-mail válido para eu conseguir responder."
        : "";
    }

    if (field === messageField) {
      return field.value.trim().length < 20
        ? "Conte um pouco mais sobre o projeto ou necessidade."
        : "";
    }

    return "";
  };

  const saveDraft = () => {
    try {
      const draft = {
        nome: nameField?.value || "",
        email: emailField?.value || "",
        mensagem: messageField?.value || "",
      };

      localStorage.setItem(draftKey, JSON.stringify(draft));
    } catch {
      /* noop */
    }
  };

  const restoreDraft = () => {
    try {
      const rawDraft = localStorage.getItem(draftKey);

      if (!rawDraft) {
        return;
      }

      const draft = JSON.parse(rawDraft);

      if (nameField) {
        nameField.value = draft.nome || "";
      }
      if (emailField) {
        emailField.value = draft.email || "";
      }
      if (messageField) {
        messageField.value = draft.mensagem || "";
      }
    } catch {
      /* noop */
    }
  };

  const validate = () => {
    const fields = [nameField, emailField, messageField].filter(Boolean);
    let firstInvalidField = null;

    fields.forEach((field) => {
      const message = validateField(field);
      setFieldError(field, message);

      if (message && !firstInvalidField) {
        firstInvalidField = field;
      }
    });

    return firstInvalidField;
  };

  restoreDraft();

  [nameField, emailField, messageField].forEach((field) => {
    field?.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") {
        setFieldError(field, validateField(field));
      }

      setFeedback("");
      saveDraft();
    });

    field?.addEventListener("blur", () => {
      setFieldError(field, validateField(field));
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const firstInvalidField = validate();

    if (firstInvalidField) {
      setFeedback("Revise os campos destacados para continuar.");
      firstInvalidField.focus();
      showToast("Revise os campos do formulário", "error");
      return;
    }

    const nome = nameField?.value.trim() || "";
    const email = emailField?.value.trim() || "";
    const mensagem = messageField?.value.trim() || "";

    const subject = `[Portfólio] Contato de ${nome}`;
    const body = [
      "Olá, Nicolas.",
      "",
      `Nome: ${nome}`,
      `E-mail: ${email}`,
      "",
      mensagem,
    ].join("\n");

    const mailto = `mailto:nicolasferreira.ismart@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setFeedback("Abrindo seu cliente de e-mail com a mensagem pronta.", true);

    try {
      localStorage.removeItem(draftKey);
    } catch {
      /* noop */
    }

    showToast("Abrindo seu cliente de e-mail", "success");
    window.location.href = mailto;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("has-js");
  initCurrentYear();
  initThemeToggle();
  initScrollProgress();
  initBackToTop();
  initRevealAnimations();
  initRoleRotator();
  initMetricCounters();
  initServiceCarousel();
  initPortfolioFilters();
  initCopyButtons();
  initContactForm();
});

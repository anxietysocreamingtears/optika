const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".site-nav");
const revealItems = document.querySelectorAll("[data-reveal]");
const tiltCards = document.querySelectorAll("[data-tilt]");
const yearTarget = document.querySelector("[data-year]");
const filterButtons = document.querySelectorAll(".catalog-filter");
const catalogCards = document.querySelectorAll(".catalog-card");
const searchInput = document.querySelector("[data-catalog-search]");
const resultsCount = document.querySelector("[data-results-count]");
const emptyState = document.querySelector("[data-catalog-empty]");

let activeFilter = "all";

const syncHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 20);
};

const closeMenu = () => {
  if (!navToggle || !navMenu) {
    return;
  }

  navToggle.setAttribute("aria-expanded", "false");
  navMenu.classList.remove("is-open");
  document.body.classList.remove("nav-open");
};

const normalizeText = (value) => value.trim().toLowerCase();

const applyCatalogFilters = () => {
  if (!catalogCards.length) {
    return;
  }

  const query = normalizeText(searchInput?.value ?? "");
  let visibleCount = 0;

  catalogCards.forEach((card) => {
    const category = card.dataset.category ?? "";
    const name = normalizeText(card.dataset.name ?? "");
    const matchesFilter = activeFilter === "all" || category === activeFilter;
    const matchesQuery = !query || name.includes(query);
    const isVisible = matchesFilter && matchesQuery;

    card.classList.toggle("is-hidden", !isVisible);

    if (isVisible) {
      visibleCount += 1;
    }
  });

  if (resultsCount) {
    resultsCount.textContent = `${visibleCount} позиций в каталоге`;
  }

  if (emptyState) {
    emptyState.hidden = visibleCount !== 0;
  }
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";

    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navMenu.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("nav-open", !isOpen);
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 960) {
      closeMenu();
    }
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -32px 0px"
    }
  );

  revealItems.forEach((item) => {
    const delay = item.dataset.revealDelay;

    if (delay) {
      item.style.setProperty("--reveal-delay", `${delay}ms`);
    }

    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (window.matchMedia("(hover: hover)").matches) {
  tiltCards.forEach((card) => {
    const maxTilt = 6;

    const resetTilt = () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    };

    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const offsetX = event.clientX - bounds.left;
      const offsetY = event.clientY - bounds.top;
      const rotateY = ((offsetX / bounds.width) - 0.5) * maxTilt * 2;
      const rotateX = (0.5 - (offsetY / bounds.height)) * maxTilt * 2;

      card.style.setProperty("--tilt-x", `${rotateY.toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${rotateX.toFixed(2)}deg`);
    });

    card.addEventListener("pointerleave", resetTilt);
    card.addEventListener("pointercancel", resetTilt);
  });
}

filterButtons.forEach((button) => {
  const isActive = button.dataset.filter === activeFilter;
  button.classList.toggle("is-active", isActive);
  button.setAttribute("aria-pressed", String(isActive));

  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter ?? "all";

    filterButtons.forEach((filterButton) => {
      const selected = filterButton === button;
      filterButton.classList.toggle("is-active", selected);
      filterButton.setAttribute("aria-pressed", String(selected));
    });

    applyCatalogFilters();
  });
});

searchInput?.addEventListener("input", applyCatalogFilters);

applyCatalogFilters();

const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".site-nav");
const revealItems = document.querySelectorAll("[data-reveal]");
const tiltCards = document.querySelectorAll("[data-tilt]");
const yearTarget = document.querySelector("[data-year]");

const syncHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
};

const closeMenu = () => {
  if (!navToggle || !navMenu) {
    return;
  }

  navToggle.setAttribute("aria-expanded", "false");
  navMenu.classList.remove("is-open");
  document.body.classList.remove("nav-open");
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
}

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
    threshold: 0.18,
    rootMargin: "0px 0px -40px 0px"
  }
);

revealItems.forEach((item) => {
  const delay = item.dataset.revealDelay;

  if (delay) {
    item.style.setProperty("--reveal-delay", `${delay}ms`);
  }

  revealObserver.observe(item);
});

const canHover = window.matchMedia("(hover: hover)").matches;

if (canHover) {
  tiltCards.forEach((card) => {
    const maxTilt = 7;

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

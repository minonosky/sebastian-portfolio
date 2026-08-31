document.querySelectorAll("[data-year]").forEach((item) => {
  item.textContent = new Date().getFullYear();
});

document.querySelectorAll('a[href="#"]').forEach((link) => {
  link.addEventListener("click", (event) => event.preventDefault());
});

document.querySelectorAll("img").forEach((image) => {
  image.draggable = false;
});

const portraitAbout = document.querySelector("#portrait-about");

if (portraitAbout) {
  const activatePortraitAbout = (force = false) => {
    const aboutRequested = new URLSearchParams(window.location.search).has("about")
      || window.location.hash === "#portrait-about";
    if (!force && !aboutRequested) return;

    portraitAbout.focus({ preventScroll: true });
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  document.querySelectorAll("[data-about-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      try {
        window.history.replaceState(null, "", "index.html?about=1");
      } catch {
        // some browsers restrict History API changes for local file URLs
      }
      activatePortraitAbout(true);
    });
  });

  window.addEventListener("hashchange", activatePortraitAbout);
  activatePortraitAbout();
}

document.addEventListener("dragstart", (event) => {
  if (event.target instanceof Element && event.target.closest("img")) {
    event.preventDefault();
  }
});

document.addEventListener("contextmenu", (event) => {
  if (event.target instanceof Element && event.target.closest("img")) {
    event.preventDefault();
  }
});

window.addEventListener("wheel", (event) => {
  if (event.ctrlKey) {
    event.preventDefault();
  }
}, { passive: false });

document.addEventListener("keydown", (event) => {
  const zoomShortcut = event.ctrlKey || event.metaKey;
  if (zoomShortcut && ["+", "-", "=", "0"].includes(event.key)) {
    event.preventDefault();
  }
});

["gesturestart", "gesturechange", "gestureend"].forEach((eventName) => {
  document.addEventListener(eventName, (event) => event.preventDefault());
});

const contactDialog = document.querySelector("[data-contact-dialog]");
const contactOpeners = document.querySelectorAll("[data-contact-open]");
const contactCloser = contactDialog?.querySelector("[data-contact-close]");
let contactReturnFocus = null;

const closeContactDialog = () => {
  if (!contactDialog) return;

  if (typeof contactDialog.close === "function") {
    contactDialog.close();
  } else {
    contactDialog.removeAttribute("open");
  }
};

contactOpeners.forEach((opener) => {
  opener.addEventListener("click", () => {
    if (!contactDialog) return;
    contactReturnFocus = opener;

    if (typeof contactDialog.showModal === "function") {
      contactDialog.showModal();
    } else {
      contactDialog.setAttribute("open", "");
    }
  });
});

contactCloser?.addEventListener("click", closeContactDialog);

contactDialog?.addEventListener("click", (event) => {
  if (event.target === contactDialog) closeContactDialog();
});

contactDialog?.addEventListener("close", () => {
  contactReturnFocus?.focus();
});

document.querySelectorAll("[data-film-roll]").forEach((roll) => {
  const track = roll.querySelector(".film-track");
  const sequence = track?.querySelector(".film-sequence");
  if (!track || !sequence) return;

  const duplicate = sequence.cloneNode(true);
  duplicate.setAttribute("aria-hidden", "true");
  duplicate.querySelectorAll("img").forEach((image) => {
    image.alt = "";
  });
  track.append(duplicate);

  const updateFilmSpeed = () => {
    const sequenceWidth = sequence.getBoundingClientRect().width;
    const pixelsPerSecond = Number.parseFloat(roll.dataset.filmSpeed) || 50;
    if (sequenceWidth <= 0) return;

    const duration = Math.max(sequenceWidth / pixelsPerSecond, 10);
    track.style.setProperty("--film-duration", `${duration.toFixed(2)}s`);
    roll.classList.add("is-ready");
  };

  window.requestAnimationFrame(updateFilmSpeed);

  if ("ResizeObserver" in window) {
    const filmObserver = new ResizeObserver(updateFilmSpeed);
    filmObserver.observe(roll);
  } else {
    window.addEventListener("resize", updateFilmSpeed);
  }
});

const hero = document.querySelector(".hero");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (hero && !reducedMotion.matches) {
  let framePending = false;

  const updateHeroFade = () => {
    const fadeDistance = Math.max(window.innerHeight * 0.72, 420);
    const progress = Math.min(Math.max(window.scrollY / fadeDistance, 0), 1);
    hero.style.setProperty("--hero-fade", String(1 - progress));
    hero.style.setProperty("--hero-shift", `${progress * 70}px`);
    framePending = false;
  };

  const requestHeroUpdate = () => {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateHeroFade);
  };

  updateHeroFade();
  window.addEventListener("scroll", requestHeroUpdate, { passive: true });
  window.addEventListener("resize", requestHeroUpdate);
}

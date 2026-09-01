document.querySelectorAll("[data-year]").forEach((item) => {
  item.textContent = new Date().getFullYear();
});

document.querySelectorAll('a[href="#"]').forEach((link) => {
  link.addEventListener("click", (event) => event.preventDefault());
});

document.querySelectorAll("img").forEach((image) => {
  image.draggable = false;
});

const typewriterTargets = Array.from(document.querySelectorAll("[data-typewriter]"));
const typewriterMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (typewriterTargets.length && !typewriterMotion.matches) {
  typewriterTargets.forEach((target) => {
    const readableText = target.innerText.replace(/\s+/g, " ").trim();
    const textNodes = [];
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach((textNode) => {
      const fragment = document.createDocumentFragment();
      const segments = textNode.textContent.match(/\s+|\S+/g) || [];

      segments.forEach((segment) => {
        if (/^\s+$/.test(segment)) {
          fragment.append(document.createTextNode(segment));
          return;
        }

        const word = document.createElement("span");
        word.className = "typewriter-word";
        word.setAttribute("aria-hidden", "true");

        Array.from(segment).forEach((character) => {
          const letter = document.createElement("span");
          letter.className = "typewriter-letter";
          letter.textContent = character;
          word.append(letter);
        });

        fragment.append(word);
      });

      textNode.replaceWith(fragment);
    });

    target.setAttribute("aria-label", readableText);
    target.classList.add("typewriter-ready");
  });

  const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

  const playTypewriter = async () => {
    await wait(280);

    for (const target of typewriterTargets) {
      target.classList.add("is-typing");
      let previousLetter = null;
      const letters = Array.from(target.querySelectorAll(".typewriter-letter"));

      for (let letterIndex = 0; letterIndex < letters.length; letterIndex += 1) {
        const letter = letters[letterIndex];
        previousLetter?.classList.remove("is-current");

        if (letter.textContent === "&") {
          letter.textContent = "^";
          letter.classList.add("is-visible", "is-current");
          await wait(340);
          letter.classList.remove("is-visible", "is-current");
          previousLetter?.classList.add("is-current");
          await wait(90);

          const deletedLetter = previousLetter;
          const letterBeforeCorrection = letters[letterIndex - 2];
          deletedLetter?.classList.remove("is-visible", "is-current");
          letterBeforeCorrection?.classList.add("is-current");
          await wait(260);

          letterBeforeCorrection?.classList.remove("is-current");
          deletedLetter?.classList.add("is-visible", "is-current");
          await wait(95);
          deletedLetter?.classList.remove("is-current");

          letter.textContent = "&";
        }

        letter.classList.add("is-visible");
        letter.classList.add("is-current");
        previousLetter = letter;
        await wait(48 + Math.random() * 38);

        if (target === typewriterTargets[0] && letter.textContent === ",") {
          await wait(520);
        }
      }

      if (target !== typewriterTargets[typewriterTargets.length - 1]) {
        previousLetter?.classList.remove("is-current");
      }
      target.classList.remove("is-typing");
      await wait(target === typewriterTargets[0] ? 760 : 190);
    }
  };

  playTypewriter();
}

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

  window.addEventListener("hashchange", () => activatePortraitAbout());
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

const projectForm = document.getElementById("project-form");
const projectNameInput = document.getElementById("project-name");
const projectCategorySelect = document.getElementById("project-category");

if (projectForm && projectNameInput && projectCategorySelect) {
  projectForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const projectName = projectNameInput.value.trim();
    if (!projectName) {
      projectNameInput.setCustomValidity("Enter a project name.");
      projectNameInput.reportValidity();
      projectNameInput.setCustomValidity("");
      return;
    }

    const projectItem = document.createElement("li");
    projectItem.textContent = projectName;
    document
      .getElementById(`${projectCategorySelect.value}-projects`)
      .append(projectItem);

    projectForm.reset();
    projectNameInput.focus();
  });
}

const serviceCarousel = document.querySelector("[data-service-carousel]");

if (serviceCarousel) {
  const slides = Array.from(
    serviceCarousel.querySelectorAll(".service-carousel__slide"),
  );
  const controls = serviceCarousel.querySelector(".service-carousel__controls");
  const previousButton = serviceCarousel.querySelector(
    "[data-carousel-previous]",
  );
  const nextButton = serviceCarousel.querySelector("[data-carousel-next]");
  const toggleButton = serviceCarousel.querySelector("[data-carousel-toggle]");
  const status = serviceCarousel.querySelector("[data-carousel-status]");
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );

  let activeIndex = slides.findIndex((slide) => !slide.hidden);
  let timerId = null;
  let manuallyPaused = false;
  let userRequestedPlayback = false;
  let pointerInside = false;
  let focusInside = false;

  function renderSlide(index, announce = false) {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.hidden = !isActive;
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    if (announce) {
      status.textContent = `Slide ${activeIndex + 1} of ${slides.length}: ${
        slides[activeIndex].querySelector("h2").textContent
      }`;
    }
  }

  function updateToggleLabel() {
    if (manuallyPaused) {
      toggleButton.textContent = "Resume slideshow";
    } else if (reducedMotion.matches && !userRequestedPlayback) {
      toggleButton.textContent = "Start slideshow";
    } else {
      toggleButton.textContent = "Pause slideshow";
    }
  }

  function canAutoAdvance() {
    return (
      !manuallyPaused &&
      !pointerInside &&
      !focusInside &&
      (!reducedMotion.matches || userRequestedPlayback)
    );
  }

  function syncPlayback() {
    if (canAutoAdvance() && timerId === null) {
      timerId = window.setInterval(() => {
        renderSlide(activeIndex + 1);
      }, 2000);
    } else if (!canAutoAdvance() && timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }

    updateToggleLabel();
  }

  previousButton.addEventListener("click", () => {
    renderSlide(activeIndex - 1, true);
  });

  nextButton.addEventListener("click", () => {
    renderSlide(activeIndex + 1, true);
  });

  toggleButton.addEventListener("click", () => {
    if (manuallyPaused || (reducedMotion.matches && !userRequestedPlayback)) {
      manuallyPaused = false;
      userRequestedPlayback = true;
    } else {
      manuallyPaused = true;
      userRequestedPlayback = false;
    }

    syncPlayback();
  });

  serviceCarousel.addEventListener("mouseenter", () => {
    pointerInside = true;
    syncPlayback();
  });

  serviceCarousel.addEventListener("mouseleave", () => {
    pointerInside = false;
    syncPlayback();
  });

  serviceCarousel.addEventListener("focusin", () => {
    focusInside = true;
    syncPlayback();
  });

  serviceCarousel.addEventListener("focusout", (event) => {
    if (!serviceCarousel.contains(event.relatedTarget)) {
      focusInside = false;
      syncPlayback();
    }
  });

  reducedMotion.addEventListener("change", (event) => {
    if (event.matches) {
      userRequestedPlayback = false;
    }

    syncPlayback();
  });

  renderSlide(activeIndex);
  controls.hidden = false;
  syncPlayback();
}
// ---------------------------------------------
// Jelly cursor — a chain of blobs spring-follows the
// mouse and stretches with movement speed, then the
// SVG "goo" filter melts them into one jelly blob.
// ---------------------------------------------
(function jellyCursor() {
  const wrap = document.getElementById("jellyCursor");
  if (!wrap) return;

  const blobs = Array.from(wrap.querySelectorAll(".blob")).map((el) => ({
    el,
    size: parseFloat(el.dataset.size),
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  }));

  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let hasMoved = false;

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    hasMoved = true;
  });

  window.addEventListener(
    "touchmove",
    (e) => {
      const t = e.touches[0];
      if (!t) return;
      mouse.x = t.clientX;
      mouse.y = t.clientY;
      hasMoved = true;
    },
    { passive: true }
  );

  let time = 0;

  function render() {
    time += 0.05;

    // Each blob eases toward the one in front of it, the
    // leader eases toward the real cursor — this lag is
    // what gives the trail its jelly "drag".
    blobs.forEach((b, i) => {
      const target = i === 0 ? mouse : blobs[i - 1];
      const ease = 0.32 - i * 0.03;
      b.x += (target.x - b.x) * ease;
      b.y += (target.y - b.y) * ease;
    });

    // Stretch the lead blob along its velocity direction,
    // like jelly being pulled as it moves.
    const lead = blobs[0];
    const vx = mouse.x - lead.x;
    const vy = mouse.y - lead.y;
    const speed = Math.min(Math.hypot(vx, vy) / 18, 1.6);
    const angle = Math.atan2(vy, vx) * (180 / Math.PI);

    blobs.forEach((b, i) => {
      const wobble = 1 + Math.sin(time + i * 1.3) * 0.06;
      const stretch = hasMoved ? 1 + speed * (i === 0 ? 0.55 : 0.25) : 1;
      const squish = hasMoved ? 1 - speed * (i === 0 ? 0.2 : 0.1) : 1;
      const s = b.size * wobble;

      b.el.style.width = `${s}px`;
      b.el.style.height = `${s}px`;
      b.el.style.transform = `translate(${b.x - s / 2}px, ${b.y - s / 2}px) rotate(${angle}deg) scale(${stretch}, ${squish})`;
    });

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();

// ---------------------------------------------
// 3D tilt — cards rotate toward the cursor for a
// light, physical sense of depth.
// ---------------------------------------------
(function tiltCards() {
  const cards = document.querySelectorAll(".tilt-card");
  if (!cards.length) return;

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      const rotateY = px * 14;
      const rotateX = -py * 14;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)";
    });
  });
})();

// ---------------------------------------------
// Scroll reveal — sections tilt up into place with
// a bit of 3D rotation as they enter the viewport.
// ---------------------------------------------
(function scrollReveal() {
  const targets = document.querySelectorAll(".reveal-3d");
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  targets.forEach((el) => observer.observe(el));
})();

// Header gets a blurred glass background once the page scrolls,
// so the nav text stays legible over busy content behind it.
(function headerScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const toggle = () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
  };

  toggle();
  window.addEventListener("scroll", toggle, { passive: true });
})();

// Let the user drop in their own photo for the About section —
// swaps the preview instantly in the browser via the file picker.
(function photoUpload() {
  const input = document.getElementById("photoInput");
  const img = document.getElementById("aboutPhoto");
  const fallback = document.getElementById("photoFallback");
  if (!input || !img) return;

  input.addEventListener("change", () => {
    const file = input.files && input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
      img.style.display = "block";
      if (fallback) fallback.style.display = "none";
    };
    reader.readAsDataURL(file);
  });
})();

// Mobile nav toggle
const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");

navToggle.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("open");
  navToggle.classList.toggle("open", isOpen);
  navToggle.setAttribute("aria-expanded", isOpen);
});

// Close mobile nav after tapping a link
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");

    document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
  });
});

// ---------------------------------------------
// Logo Lightbox Pop-up Modal Functionality
// ---------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('logoModal');
  const modalMark = document.getElementById('modalLogoMark');
  const modalTitle = document.getElementById('modalLogoTitle');
  const modalTag = document.getElementById('modalLogoTag');
  const closeBtn = document.querySelector('.modal-close');

  // Select all 8 logo cards
  const logoCards = document.querySelectorAll('.logo-card');

  logoCards.forEach(card => {
    card.addEventListener('click', () => {
      // Extract inner visual icon, title, and tag
      const markElement = card.querySelector('.logo-card-mark, .logo-placeholder');
      const nameElement = card.querySelector('.logo-card-name');
      const tagElement = card.querySelector('.logo-card-tag');

      if (markElement) modalMark.innerHTML = markElement.innerHTML;
      modalTitle.innerText = nameElement ? nameElement.innerText : '';
      modalTag.innerText = tagElement ? tagElement.innerText : '';

      // Open Modal
      if (modal) modal.classList.add('active');
    });
  });

  // Close Modal on Close (X) click
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  // Close Modal on Outside Dark Overlay click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }
});

// Image Popup / Lightbox Functionality
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImg");
  const closeBtn = document.querySelector(".modal-close");

  if (modal && modalImg && closeBtn) {
    // Social posts aur baaki cards/posters ke images par click listener
    document.querySelectorAll(".sp-card img").forEach((img) => {
      img.addEventListener("click", function () {
        modal.classList.add("active");
        modalImg.src = this.src;
      });
    });

    // Close button click handler
    closeBtn.addEventListener("click", function () {
      modal.classList.remove("active");
    });

    // Background par click karne par popup band karne ke liye
    modal.addEventListener("click", function (e) {
      if (e.target !== modalImg) {
        modal.classList.remove("active");
      }
    });
  }
});
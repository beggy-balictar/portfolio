function toggleMenu() {
  const nav = document.getElementById("navLinks");
  if (!nav) return;
  nav.classList.toggle("show");
}

const starCount = 200;

for (let i = 0; i < starCount; i++) {
  const star = document.createElement("div");
  star.classList.add("star");

  star.style.left = Math.random() * 100 + "vw";

  const size = Math.random() * 4 + 1;
  star.style.width = size + "px";
  star.style.height = size + "px";

  star.style.animationDuration = (5 + Math.random() * 15) + "s";
  star.style.animationDelay = Math.random() * 12 + "s";

  document.body.appendChild(star);
}

document.addEventListener("DOMContentLoaded", () => {
  const modalElement = document.getElementById("certificateModal");
  if (!modalElement || typeof bootstrap === "undefined") return;

  const modal = new bootstrap.Modal(modalElement);
  const modalImage = document.getElementById("modalCertificateImage");

  const openCertificate = (img) => {
    if (!img) return;
    modalImage.src = img.src;
    modalImage.alt = img.alt;
    modal.show();
  };

  document.querySelectorAll(".certi-card img, .credential-card img").forEach((img) => {
    img.addEventListener("click", () => openCertificate(img));
  });

  document.querySelectorAll(".view-credential").forEach((button) => {
    button.addEventListener("click", () => {
      const img = button.closest(".credential-card").querySelector("img");
      openCertificate(img);
    });
  });
});

function popGroup(tiles) {
  if (!tiles.length) return;

  tiles.forEach((tile, i) => {
    tile.classList.add("pop-hidden");
    tile.style.animationDelay = (i * 0.06) + "s";
    tile.addEventListener("animationend", () => {
      tile.classList.remove("pop-show");
      tile.style.animationDelay = "";
    }, { once: true });
  });

  const watcher = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      tiles.forEach((tile) => {
        tile.classList.remove("pop-hidden");
        tile.classList.add("pop-show");
      });
      watcher.disconnect();
    }
  }, { threshold: 0.15 });

  watcher.observe(tiles[0].parentElement);
}

document.querySelectorAll(".tech-stack, .credential-board, .project-panel").forEach((group) => {
  popGroup(Array.from(group.querySelectorAll(".tech-card, .credential-card, .project-card")));
});

const aboutCard = document.querySelector(".abt__card");
if (aboutCard) popGroup([aboutCard]);
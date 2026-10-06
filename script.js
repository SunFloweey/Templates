const modal = document.querySelector("[data-modal]");
const frame = document.querySelector("[data-preview-frame]");
const templateUrl = "http://localhost:3001/#dashboard";

function openPreview() {
  frame.src = templateUrl;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closePreview() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  window.setTimeout(() => { frame.src = "about:blank"; }, 250);
}

document.querySelectorAll("[data-open-preview]").forEach((button) => button.addEventListener("click", openPreview));
document.querySelectorAll("[data-close-preview]").forEach((button) => button.addEventListener("click", closePreview));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) closePreview();
});

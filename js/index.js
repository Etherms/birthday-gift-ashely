window.addEventListener("DOMContentLoaded", () => {
  const music = document.getElementById("bg-music");

  // Try autoplay
  music.play().catch(() => {
    console.log("Autoplay blocked by browser");
  });

  // Toggle pause/play anywhere on page click
  document.addEventListener("click", () => {
    if (music.paused) {
      music.play();
    } else {
      music.pause();
    }
  });
});
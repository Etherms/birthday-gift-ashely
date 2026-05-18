const video = document.getElementById("ashleyVideo");
const videoCard = document.getElementById("videoCard");
const thumbnailOverlay = document.getElementById("thumbnailOverlay");

async function openPortraitFullscreen() {
    thumbnailOverlay.classList.add("hidden");

    try {
    await video.play();

    if (videoCard.requestFullscreen) {
        await videoCard.requestFullscreen();
    } else if (videoCard.webkitRequestFullscreen) {
        videoCard.webkitRequestFullscreen();
    }

    if (screen.orientation && screen.orientation.lock) {
        try {
        await screen.orientation.lock("portrait");
        } catch (err) {
        console.log("Portrait lock not supported on this device.");
        }
    }
    } catch (err) {
    console.log("Video play/fullscreen error:", err);
    }
}

thumbnailOverlay.addEventListener("click", openPortraitFullscreen);

video.addEventListener("ended", () => {
    thumbnailOverlay.classList.remove("hidden");

    if (document.fullscreenElement) {
    document.exitFullscreen();
    }
});

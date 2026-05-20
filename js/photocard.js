
const cards = document.querySelectorAll(".photo-card");

const lightbox = document.getElementById("photoLightbox");
const lightboxImg = document.getElementById("lightboxImg");

const closeBtn = document.querySelector(".lightbox-close");
const prevBtn = document.querySelector(".lightbox-prev");
const nextBtn = document.querySelector(".lightbox-next");

const countText = document.querySelector(".lightbox-count");

let currentIndex = 0;
let startX = 0;

function updateLightbox(){

    const img = cards[currentIndex].querySelector("img");

    lightboxImg.src = img.src;

    countText.textContent =
    `${currentIndex + 1} / ${cards.length}`;
}

function openLightbox(index){

    currentIndex = index;

    updateLightbox();

    lightbox.classList.add("active");

    document.body.classList.add("no-scroll");
}

function closeLightbox(){

    lightbox.classList.remove("active");

    document.body.classList.remove("no-scroll");
}

function nextPhoto(){

    currentIndex =
    (currentIndex + 1) % cards.length;

    updateLightbox();
}

function prevPhoto(){

    currentIndex =
    (currentIndex - 1 + cards.length) % cards.length;

    updateLightbox();
}

cards.forEach((card, index)=>{

    card.addEventListener("click", ()=>{

    openLightbox(index);
    });

    card.addEventListener("touchstart", ()=>{

    card.classList.add("touched");
    });

    card.addEventListener("touchend", ()=>{

    setTimeout(()=>{

        card.classList.remove("touched");

    },250);

    card.style.transform = "";
    });

    card.addEventListener("touchmove", (e)=>{

    const touch = e.touches[0];

    const rect = card.getBoundingClientRect();

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const rotateY =
    ((x / rect.width) - .5) * 10;

    const rotateX =
    ((y / rect.height) - .5) * -10;

    card.style.transform =
    `
    perspective(900px)
    rotateX(${rotateX}deg)
    rotateY(${rotateY}deg)
    scale(1.04)
    `;
    });

});

closeBtn.addEventListener("click", closeLightbox);

nextBtn.addEventListener("click", nextPhoto);

prevBtn.addEventListener("click", prevPhoto);

lightbox.addEventListener("click", (e)=>{

    if(e.target === lightbox){

    closeLightbox();
    }
});

document.addEventListener("keydown", (e)=>{

    if(!lightbox.classList.contains("active")) return;

    if(e.key === "Escape") closeLightbox();

    if(e.key === "ArrowRight") nextPhoto();

    if(e.key === "ArrowLeft") prevPhoto();
});

lightbox.addEventListener("touchstart", (e)=>{

    startX = e.touches[0].clientX;
});

lightbox.addEventListener("touchend", (e)=>{

    const endX = e.changedTouches[0].clientX;

    const diff = startX - endX;

    if(Math.abs(diff) > 50){

    if(diff > 0){

        nextPhoto();

    }else{

        prevPhoto();
    }
    }
});

const CORRECT_PASSWORD = "02-22";

const input = document.getElementById("passwordInput");
const button = document.getElementById("enterBtn");
const errorText = document.getElementById("errorText");

function unlockSite(){

    const enteredPassword = input.value.trim();

    if(enteredPassword === CORRECT_PASSWORD){

    sessionStorage.setItem("birthdayAccess", "granted");

    window.location.href = "/pages/homepage.html";

    } else {

    errorText.textContent = "Wrong password ♡";
    }
}

button.addEventListener("click", unlockSite);

input.addEventListener("keydown", (e) => {

    if(e.key === "Enter"){
    unlockSite();
    }

});
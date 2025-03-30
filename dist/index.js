"use strict";
const button = document.getElementById("button");
function welcome() {
    console.log("Suii!!");
}
if (button) {
    button.addEventListener('click', welcome);
}

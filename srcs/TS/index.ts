const button = document.getElementById("button") as HTMLButtonElement | null;

function welcome() {
	console.log("Suii!!");
}

if (button) {
	button.addEventListener('click', welcome);
}

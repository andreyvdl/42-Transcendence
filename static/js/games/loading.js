export async function loadingGameInfo() {
	const gameInfo = document.getElementById("game-info");

	if (!gameInfo) return ;

	gameInfo.style.display = "block";
	await new Promise(r => setTimeout(r, 3000));
	gameInfo.style.display = "none";
}

export async function loadingGameCanvas() {
	const gameCanvas = document.getElementById("game-canvas");

	if (!gameCanvas) return ;

	gameCanvas.style.display = "block";
}

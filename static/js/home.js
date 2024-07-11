import {defaultMode, tournamentMode} from "./games/game-modes.js"

export default function homePageSetup() {
	const modeOptions = document.getElementById("modeSelect");
	const gameOptions = document.getElementById("gameSelect");

	const gameForm = document.getElementById("form-game");
	if (!modeOptions || !gameOptions) return;

	attachEvent(modeOptions, 'change', updatePlayerCount);
	attachEvent(gameOptions, 'change', updatePlayerCount);

	updatePlayerCount();
	attachEvent(gameForm, 'submit', playGame);
}

function updatePlayerCount() {
	const selectedMode = document.querySelector('#modeSelect option:checked');
	const selectedGame = document.querySelector('#gameSelect option:checked');
	const divPlayers = document.getElementById("players");
	
	if (!selectedMode || !divPlayers) return;

	const startbtn = document.getElementById("startGame");

	if(selectedMode.value === "0" || selectedGame.value === "0") return;
	
	startbtn.removeAttribute("disabled");
	divPlayers.innerHTML = "";
	
	if (selectedMode.value === "pvp") {
		divPlayers.innerHTML = ` 
			<input class="mt-2 form-control form-control-lg" type="text" placeholder="Player 2" id="player2" name="player2" required/>
		`;
	}
	else if (selectedMode.value === "tournament") {
		divPlayers.innerHTML = `
			<input class="mt-2 form-control form-control-lg" type="text" placeholder="Player 2" id="player2" name="player2" required/>
			<input class="mt-2 form-control form-control-lg" type="text" placeholder="Player 3" id="player3" name="player3" required/>
			<input class="mt-2 form-control form-control-lg" type="text" placeholder="Player 4" id="player4" name="player4" required/>
		`;
	}
	else if (selectedMode.value === "pve") {
		divPlayers.innerHTML = "";
	}
}

function playGame(event) {
	event.preventDefault();

	const formGame = document.getElementById('form-game');
	const formData = new FormData(formGame);
	const mode = formData.get("mode");

	if (mode === "pvp" || mode === "pve") {
		defaultMode(formData)
	} else if (mode === "tournament") {
		tournamentMode(formData)
	}
}

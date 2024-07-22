import {defaultMode, tournamentMode} from "./games/game-modes.js"

export default function homePageSetup() {
	const modeOptions = document.getElementById("modeSelect");
	const gameOptions = document.getElementById("gameSelect");
    const logoutBtn = document.getElementById('logout-btn');

    attachEvent(logoutBtn, 'click', logout);
	const gameForm = document.getElementById("form-game");
	if (!modeOptions || !gameOptions) return;

	attachEvent(modeOptions, 'change', updatePlayerCount);
	attachEvent(gameOptions, 'change', updatePlayerCount);

	updatePlayerCount();
	attachEvent(gameForm, 'submit', playGame);
}

function logout(event) {
    event.preventDefault();

    const url = `${BASE_URL}/auth/logout`;

    fetch(url, {
        method: 'POST'
    })
        .then((response) => {
            if (response.ok || response.status == 302)
                return response.json();
            else
                return new Error(response.status);
        })
        .then((data) => {
            if (data.redirect)
                handleRedirect(data.redirect);
        })
        .catch(error => console.error(error));
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
			<input class="mt-2 form-control form-control-lg" type="text" placeholder="Player 2" id="player2" name="player2" required autocomplete="username"/>
		`;
	}
	else if (selectedMode.value === "tournament") {
		divPlayers.innerHTML = `
			<input class="mt-2 form-control form-control-lg" type="text" placeholder="Player 2" id="player2" name="player2" required autocomplete="username"/>
			<input class="mt-2 form-control form-control-lg" type="text" placeholder="Player 3" id="player3" name="player3" required autocomplete="username"/>
			<input class="mt-2 form-control form-control-lg" type="text" placeholder="Player 4" id="player4" name="player4" required autocomplete="username"/>
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

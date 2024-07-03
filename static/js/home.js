export default function homePageSetup() {
	const modeOptions = document.getElementById("modeSelect");
	const gameOptions = document.getElementById("gameSelect");

	const gameForm = document.getElementById("form-game");
	if (!modeOptions || !gameOptions) return;

	attachEvent(modeOptions, 'change', updatePlayerCount);
	attachEvent(gameOptions, 'change', updatePlayerCount);

	updatePlayerCount();
	attachEvent(gameForm, 'submit', redirToGame);
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
	
	if (selectedMode.value === "x1") {
		divPlayers.innerHTML = ` 
		<input class="mt-2 form-control form-control-lg" type="text" placeholder="Player 2" id="player2" name="player2" required/>
		`;
	}
	else if (selectedMode.value === "torneio") {
		divPlayers.innerHTML = `
			<input class="mt-2 form-control form-control-lg" type="text" placeholder="Player 2" id="player2" name="player2" required/>
			<input class="mt-2 form-control form-control-lg" type="text" placeholder="Player 3" id="player3" name="player3" required/>
			<input class="mt-2 form-control form-control-lg" type="text" placeholder="Player 4" id="player4" name="player4" required/>
		`;
	}
	else if (selectedMode.value === "ia") {
		divPlayers.innerHTML = "";
	}
}

function redirToGame(event) {
	event.preventDefault();

	const url = `${BASE_URL}/home/`;
	const formGame = document.getElementById('form-game');
	const formData = new FormData(formGame);
	console.table(formGame);
	fetch(url, {
		method: 'POST',
		headers: {
			'X-CSRFToken': getCookie('csrftoken'),
		},
		body: formData,
	})
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			if (data.redirect)
				fetch(data.redirect, {
					method: 'POST',
					headers: {
						'X-CSRFToken': getCookie('csrftoken'),
					},
					body: JSON.stringify(data.payload),
				})
					.then(response2 => {
						if (!response2.ok) throw new Error("OPS!");
						return response2.json();
					})
					.then(data2 => {
						if (data2.innerHtml) updatePage(data2.innerHtml);
					})
					.catch(error => console.log(error));
		})
}


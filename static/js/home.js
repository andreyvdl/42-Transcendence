export default function homePageSetup() {
	const modeRadios = document.querySelectorAll('input[name="mode"]');
	const gameForm = document.getElementById("form-game");

	if (modeRadios.length === 0) return;

	modeRadios.forEach(radio => {
		radio.addEventListener('change', updatePlayerCount);
	});
	updatePlayerCount();
	attachEvent(gameForm, 'submit', redirToGame);
}

function updatePlayerCount() {
	const selectedMode = document.querySelector('input[name="mode"]:checked');
	const divPlayers = document.getElementById("players");

	if (!selectedMode || !divPlayers) return;

	const startbtn = document.getElementById("startGame");

	startbtn.removeAttribute("disabled");
	divPlayers.innerHTML = "";

	if (selectedMode.value === "x1") {
		divPlayers.innerHTML = `
			<label for="player2">Player 2:</label>
			<input type="text" id="player2" name="player2" required/>
		`;
	}
	else if (selectedMode.value === "torneio") {
		divPlayers.innerHTML = `
			<label for="player2">Player 2:</label>
			<input type="text" id="player2" name="player2" required/>
			<label for="player3">Player 3:</label>
			<input type="text" id="player3" name="player3" required/>
			<label for="player4">Player 4:</label>
			<input type="text" id="player4" name="player4" required/>
		`;
	}
}

function redirToGame(event) {
	event.preventDefault();

	const url = `${BASE_URL}/home/`;
	const formGame = document.getElementById('form-game');
	const formData = new FormData(formGame);

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


function createTournament(tournamentOptions) {
	const url = `${BASE_URL}/tournament/`;

	return (
		fetch(url, {
			method: 'POST',
			headers: {
				'X-CSRFToken': getCookie('csrftoken'),
			},
			body: tournamentOptions,
		})
			.then(response => response.json())
			.then(data => {
				if (data.id)
					return (data.id)
				else
					return (null)
			})
			.catch(error => console.log(error))
	);
}

function tournamentMatch(tournamentId) {
	const url = `${BASE_URL}/tournament/${tournamentId}`;

	fetch(url, {
		method: 'GET',
		headers: {
			'X-CSRFToken': getCookie('csrftoken'),
		}
	})
		.then(response => response.json())
		.then(data => {
			if (data.winner) {
				updatePage(`<h1>Winner: ${data.winner}</h1>`)
			} else if (data.innerHtml) {
				updatePage(data.innerHtml);
			} else {
				updatePage(ERROR);
			}
		})
		.catch(error => console.log(error));
}

async function tournamentSaveMatch(tournamentId, match) {
	const url = `${BASE_URL}/tournament/${tournamentId}`;

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'X-CSRFToken': getCookie('csrftoken'),
			},
			body: JSON.stringify(match)
		});
		const data = await response.json()
		if (data.status === "SUCCESS") {
			console.log("PARTIDA SALVA");
			return "SUCCESS";
		} else {
			console.log("ERRO AO SALVAR PARTIDA");
			return "ERROR";
		}
	} catch (error) {
		console.log(error);
		return "ERROR";
	}
}

function saveMatch(match) {
	const url = `${BASE_URL}/api/save_match/${match.player2}/${match.scores.playerOne}v${match.scores.playerTwo}/${match.winner}`;

	fetch(url)
		.then(response => {
			if (response.status !== 200) {
				return new Error(response.status);
			}
			return response.json();
		})
		.then(data => {
			console.log(data);
		})
		.catch(error => console.log(error));
}

export async function sendMatchResult(match) {
	if (match.gameMode === "pve") return; // Not save matchs versus IA

	if (match.gameMode === "pvp") {
		saveMatch(match);
	} else {
		const resultSave = await tournamentSaveMatch(TOURNAMENT_ID, match);
		if (resultSave === "SUCCESS") {
			// NEXT MATCH
			tournamentMatch(TOURNAMENT_ID);
		} else {
			updatePage("ERROR_SENDMATCH");
		}
	}
}

export function tournamentMode(tournamentOptions) {
	createTournament(tournamentOptions).
		then(tournamentId => {
			if (tournamentId === null) {
				updatePage("ERROR");
				return;
			}

			TOURNAMENT_ID = tournamentId;

			// FIRST MATCH
            tournamentMatch(tournamentId)
		});
}

export function defaultMode(gameOptions) {
	const game = gameOptions.get("game");
	const url = `${BASE_URL}/games/${game}`

	fetch(url, {
		method: 'POST',
		headers: {
			'X-CSRFToken': getCookie('csrftoken'),
		},
		body: gameOptions,
	})
		.then(response => response.json())
		.then(data => {
			if (data.innerHtml)
				updatePage(data.innerHtml);
		})
		.catch(error => console.log(error));
}

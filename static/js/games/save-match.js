import { tournamentMatch } from "./game-modes.js"

async function tournamentSaveMatch(tournamentId, match) {
	const url = `${BASE_URL}/tournament/${tournamentId}/save_match`;

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

export async function saveMatchResult(match) {
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

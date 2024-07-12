import { tournamentMatch } from "./game-modes.js"

async function tournamentSaveMatch(tournamentId, match) {
	const url = `${BASE_URL}/tournament/${tournamentId}/save_match`;
	const options = {
		method: 'POST',
		headers: {
			'X-CSRFToken': getCookie('csrftoken'),
		},
		body: JSON.stringify(match)
	}

	try {
		const data = await fetchData(url, options);

		if (data.status === "saved") {
			return true;
		} else {
			return false;
		}
	} catch (error) {
		return false;
	}
}

async function saveMatch(match) {
	const url = `${BASE_URL}/api/save_match/${match.player2}/${match.scores.playerOne}v${match.scores.playerTwo}/${match.winner}`;

	try {
		const data = await fetchData(url);

		// DEBUG
		console.table(data);

		return true
	} catch (error) {
		if (error.data.innerHtml)
			updatePage(data.innerHtml);
		return false
	}
}

export async function saveMatchResult(match) {
	if (match.gameMode === "pve") return; // Not save matchs versus IA

	try {
		var savedMatch = false;
		if (match.gameMode === "pvp")
			savedMatch = await saveMatch(match);
		else
			savedMatch = await tournamentSaveMatch(TOURNAMENT_ID, match);

		if (!savedMatch) {
			const error = new Error(`Error when saving the game with GAME_MODE = ${match.gameMode}`);
			throw error;
		}

		if (match.gameMode == "pvp")
			handleRedirect('/home/');
		else
			await tournamentMatch(TOURNAMENT_ID); // NEXT MATCH OF TOURNAMENT
	} catch {
		console.error(error)
		handleRedirect('/home/');
	}
}

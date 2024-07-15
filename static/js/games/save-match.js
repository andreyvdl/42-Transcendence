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
	console.table(match);
	const url = `${BASE_URL}/api/save_match/${match.player2}/${match.scores.p1}v${match.scores.p2}/${match.winner}`;

	try {
		await fetchData(url);
		return true
	} catch (error) {
		if (error.data && error.data.innerHtml)
			updatePage(error.data.innerHtml);
		return false
	}
}

export async function saveMatchResult(match) {
	if (match.gameMode === "pve") return;

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
			await tournamentMatch(TOURNAMENT_ID);
	} catch {
		console.error(error)
		handleRedirect('/home/');
	}
}

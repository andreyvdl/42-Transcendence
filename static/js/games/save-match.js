import { tournamentMatch } from "./game-modes.js";

async function loadingResultPage(match) {
	const url = `${BASE_URL}/games/match-result/`;
	const options = {
		method: 'POST',
		headers: {
			'X-CSRFToken': getCookie('csrftoken'),
			'X-Requested-With': 'XMLHttpRequest',
		},
		body: JSON.stringify(match)
	}

	try {
		const data = await fetchData(url, options);

		if (data.innerHtml)
			updatePage(data.innerHtml);
		else {
			const error = new Error(`Error when loading result page`);
			throw error;
		}
	} catch (error) {
		console.log(error)
		handleLocation("/home/")
	}
}

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
	const url = `${BASE_URL}/api/save_match/${match.gameMode}/${match.game}/${match.player1}/${match.player2}/${match.scores.p1}X${match.scores.p2}/${match.winner}`;

	try {
		await fetchData(url);
		return true
	} catch (error) {
		if (error.data && error.data.innerHtml)
			updatePage(error.data.innerHtml);
		return false
	}
}

export async function endOfMatch(match) {
	await sleep(1000);
	if (match.gameMode === "pve") {
		await loadingResultPage(match);
		return ;
	}

	try {
		var savedMatch = false;
		if (match.gameMode === "tournament") await tournamentSaveMatch(TOURNAMENT_ID, match);
		savedMatch = await saveMatch(match);

		if (!savedMatch) {
			const error = new Error(`Error when saving the game with GAME_MODE = ${match.gameMode}`);
			throw error;
		}

		if (match.gameMode === "pvp") {
			await loadingResultPage(match);
		} else {
			if (match.bracket !== "FINAL") {
				await loadingResultPage(match);
				await sleep(3000);
			}
			await tournamentMatch(TOURNAMENT_ID);
		}
	} catch {
		console.error(error)
		handleRedirect('/home/');
	}
}

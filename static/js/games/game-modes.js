async function createTournament(tournamentOptions) {
	const url = `${BASE_URL}/tournament/create`;
	const options = {
		method: 'POST',
		headers: {
			'X-CSRFToken': getCookie('csrftoken'),
		},
		body: tournamentOptions,
	};
	
	try {
		const data = await fetchData(url, options)

		if (data.id)
			return (data.id);
		if (data.innerHtml)
			updatePage(data.innerHtml)

		return (null);
	} catch (error) {
		if (error.data && error.data.title)
			toastCall(error.data);
		return (null)
	}
}

export async function tournamentMatch(tournamentId) {
	const url = `${BASE_URL}/tournament/${tournamentId}/current_match`;
	const options = {
		method: 'GET',
		headers: {
			'X-CSRFToken': getCookie('csrftoken'),
		}
	};

	try {
		const data = await fetchData(url, options);

		if (data.innerHtml)
			updatePage(data.innerHtml);
	} catch (error) {
		if (error.data && error.data.title)
			toastCall(error.data);
	}
}

export async function tournamentMode(tournamentOptions) {
	TOURNAMENT_ID = await createTournament(tournamentOptions);

	if (TOURNAMENT_ID === null)
		return;

	tournamentMatch(TOURNAMENT_ID);
}

export async function defaultMode(gameOptions) {
	const game = gameOptions.get("game");
	const url = `${BASE_URL}/games/${game}`
	const options = {
		method: 'POST',
		headers: {
			'X-CSRFToken': getCookie('csrftoken'),
		},
		body: gameOptions,
	};

	try {
		const data = await fetchData(url, options);

		if (data.innerHtml)
			updatePage(data.innerHtml);
	} catch (error) {
		if (error.data && error.data.title)
			toastCall(error.data);
	}
}

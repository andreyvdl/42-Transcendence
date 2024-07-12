function createTournament(tournamentOptions) {
	const url = `${BASE_URL}/tournament/create`;

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
				else {
					updatePage(data.innerHtml)
					return (null)
				}
			})
			.catch(error => console.log(error))
	);
}

export function tournamentMatch(tournamentId) {
	const url = `${BASE_URL}/tournament/${tournamentId}/current_match`;

	fetch(url, {
		method: 'GET',
		headers: {
			'X-CSRFToken': getCookie('csrftoken'),
		}
	})
		.then(response => response.json())
		.then(data => {
			if (data.innerHtml) {
				updatePage(data.innerHtml);
			} else {
				updatePage(ERROR);
			}
		})
		.catch(error => console.log(error));
}

export function tournamentMode(tournamentOptions) {
	createTournament(tournamentOptions).
		then(tournamentId => {
			if (tournamentId === null) {
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

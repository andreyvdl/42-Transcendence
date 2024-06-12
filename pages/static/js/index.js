window.addEventListener("DOMContentLoaded", () => {
	handleLocation();
	window.onpopstate = handleLocation;

	window.addEventListener('click', (event) => {
		if (event.target instanceof HTMLElement && event.target.hasAttribute("href"))
			route(event);
	}, true);

	// window.addEventListener('load', () => {
	// 	const url = PREFIX + 'pages/online';

	// 	fetch(url, {
	// 		method: 'POST'
	// 	});
	// });

	window.addEventListener('beforeunload', () => {
		const url = PREFIX + 'pages/offline';

		fetch(url, {
			method: 'POST'
		});
	});
});

const handleLocation = () => {
	newUrl = window.location.pathname;
	fetch(newUrl, {
		headers: {
			'X-Requested-With': 'XMLHttpRequest',
		},
	})
		.then(response => {
			if (response.ok || response.status == 302)
				return response.json();
			else
				return new Error(response.status);
		})
		.then((data) => {
			if (data['innerHtml'])
				document.getElementById('mainContent').innerHTML = data['innerHtml'];
			else if (data['redirect']) {
				window.history.pushState({}, "", data.redirect);
				fetch(data['redirect'], {
					headers: {
						'X-Requested-With': 'XMLHttpRequest',
					}
				})
					.then((response) => {
						if (response.ok)
							return response.json();
						else
							return new Error(response.status);
					})
					.then((data) => {
						if (data['innerHtml'])
							document.getElementById('mainContent').innerHTML = data['innerHtml'];
					})
					.catch(error => console.log(error));
			} else {
				document.getElementById('mainContent').innerHTML = "Error";
			}
		})
		.catch(error => console.log(error));
};

const route = (event) => {
    event.preventDefault();

	const targetUrl = event.target.href;
	const currentUrl = window.location.href;

	if (targetUrl != currentUrl)
		window.history.pushState({}, "", event.target.href);
    handleLocation();
};

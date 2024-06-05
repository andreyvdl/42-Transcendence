window.addEventListener("DOMContentLoaded", () => {
	handleLocation();
	window.onpopstate = handleLocation;

    document.querySelectorAll('a.nav-link').forEach(link => {
		link.addEventListener('click', route);
	});
});

function initializePageScripts(url) {
	if (url == '/pong') {
		initializePongGame();
	}
	else if (url == '/pong-3d') {
		const { initializePongGame3d } = import('/static/pong-game-3d/index.js');
		initializePongGame3d();
	}
};

const handleLocation = async () => {
	const route = window.location.pathname;
	await fetch(route, {
		headers : {
			'Accept': 'text/html',
			'X-Requested-With': 'XMLHttpRequest',
		},
	})
	.then(Response => Response.text())
	.then(html => {
		document.getElementById("mainContent").innerHTML = html;
		initializePageScripts(route);
	});
};

const route = (event) => {
    event.preventDefault();

	const targetUrl = event.target.href;
	const currentUrl = window.location.href;

	if (targetUrl != currentUrl)
		window.history.pushState({}, "", event.target.href);
    handleLocation();
};

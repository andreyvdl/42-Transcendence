import * as Setup from './pages_setup.js'

function handlePageScripts() {
	const loginPage = document.getElementById('login-page');
	const registerPage = document.getElementById('register-page');
	const accountPage = document.getElementById('account-page');
	const pongGamePage = document.getElementById('pong-game-page');
	const jpkGamePage = document.getElementById('jkp-game-page');

	if (loginPage) {
		Setup.loginPageSetup();
	} else if (registerPage) {
		Setup.registerPageSetup();
	} else if (accountPage)  {
		Setup.accountPageSetup();
	} else if (pongGamePage) {
		Setup.pongGamePageSetup();
	} else if (jpkGamePage) {
		Setup.jkpGamePageSetup();
	}
}

const observer = new MutationObserver((mutationsList) => {
	for (let mutation of mutationsList) {
		if (mutation.type == 'childList')
			handlePageScripts();
	}
});

function handleRedirect(url) {
    window.history.pushState({}, "", url);
    handleLocation();
};

function handleLocation() {
	const newUrl = window.location.pathname;
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
			if (data.innerHtml)
                updatePage(data.innerHtml);
			else if (data.redirect) {
				handleRedirect(data.redirect);
			} else {
                updatePage("ERROR");
			}
		})
		.catch(error => console.log(error));
};

function route(event) {
    event.preventDefault();

	const targetUrl = event.target.href;
	const currentUrl = window.location.href;

	if (targetUrl != currentUrl)
		window.history.pushState({}, "", event.target.href);
    handleLocation();
};

window.addEventListener("DOMContentLoaded", () => {
	handleLocation();
	window.onpopstate = handleLocation;

	// navbar
	window.addEventListener('click', (event) => {
		const target = event.target;
		if (target instanceof HTMLElement && target.classList.contains('nav-link') && target.hasAttribute("href"))
			route(event);
	}, true);

	observer.observe(document.getElementById('mainContent'), { childList: true });
});

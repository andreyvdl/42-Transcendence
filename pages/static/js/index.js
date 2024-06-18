import * as pages from './pages.js'

function handlePageScripts() {
	const loginPage = document.getElementById('login-page');
	const registerPage = document.getElementById('register-page');
	const accountPage = document.getElementById('account-page');
	const pongGamePage = document.getElementById('pong-game-page');
	const jpkGamePage = document.getElementById('jkp-game-page');

	if (loginPage) {
		pages.loginPageSetup();
	} else if (registerPage) {
		pages.registerPageSetup();
	} else if (accountPage)  {
		pages.accountPageSetup();
	} else if (pongGamePage) {
		pages.pongGamePageSetup();
	} else if (jpkGamePage) {
		pages.jkpGamePageSetup();
	}
}

const observer = new MutationObserver((mutationsList) => {
	for (let mutation of mutationsList) {
		if (mutation.type == 'childList')
			handlePageScripts();
	}
});

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

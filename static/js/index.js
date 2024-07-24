import * as pages from './pages.js'

function handlePageScripts() {
	const loginPage = document.getElementById('login-page');
	const registerPage = document.getElementById('register-page');
	const accountPage = document.getElementById('account-page');
	const homePage = document.getElementById('home-page');
	const pongGamePage = document.getElementById('pong-game-page');
	const jpkGamePage = document.getElementById('jkp-game-page');

	if (loginPage) {
		pages.loginPageSetup();
	} else if (registerPage) {
		pages.registerPageSetup();
	} else if (homePage) {
		pages.homePageSetup();
	} else if (accountPage) {
		pages.accountPageSetup();
	} else if (pongGamePage) {
		const script = document.createElement('script');

		script.text = document.getElementById('script-game').textContent;
		pongGamePage.appendChild(script);
		pages.pongGamePageSetup();
	} else if (jpkGamePage) {
		const script = document.createElement('script');

		script.text = document.getElementById('script-game').textContent;
		jpkGamePage.appendChild(script);
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

	window.addEventListener('click', (event) => {
		const target = event.target;
		if (target instanceof HTMLElement && target.hasAttribute("href") && target.id !== "intraLink") {
			event.preventDefault()
			route(target);
		} else if (target.id === "go-home") {
			event.preventDefault()
			route(target.parentNode);
		}
	}, true);

	observer.observe(document.getElementById('mainContent'), { childList: true });
});

// https://docs.djangoproject.com/en/4.1/howto/csrf/#using-csrf-protection-with-ajax
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function fetchData(url, options = {}) {
	try {
		const response = await fetch(url, options);
		const data = await response.json()

		if (!response.ok) {
			const error = new Error(data.error || response.statusText);
			error.response = response;
			error.data = data;
			throw error;
		}

		return data;
	} catch (error) {
		// DEBUG
		console.error(error);

		throw error;
	}
}

function handleLocation() {
	const newUrl = window.location.pathname;
	fetch(newUrl, {
		headers: {
			'X-Requested-With': 'XMLHttpRequest',
		},
		body: payload,
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

function handleRedirect(url) {
    window.history.pushState({}, "", url);
    handleLocation();
};

function attachEvent(element, event, handler) {
    if (element) {
        element.removeEventListener(event, handler);
        element.addEventListener(event, handler);
    }
}

function updatePage(innerHtml) {
    document.getElementById('mainContent').innerHTML = innerHtml;
}

function toastCall(data) {
	const toast = document.getElementById("liveToast");
	const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);
	const toastTitle = document.querySelector("strong.me-auto");
	const toastBody = document.querySelector("div.toast-body");

	toastTitle.innerHTML = data.title;
	toastBody.innerHTML = data.text;
	toastBootstrap.show();
}

const BASE_URL = window.location.protocol + "//" + window.location.host;

var INTRA_URL = "";
if (window.location.protocol === "https:")
	INTRA_URL = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-b03d3e34ca48d59cf52b525eef892e52f49bc88e15972bf41e3dc501fdbf7968&redirect_uri=https%3A%2F%2Flocalhost%3A5000%2Fauth%2Fintra&response_type=code";
else
	INTRA_URL = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-b03d3e34ca48d59cf52b525eef892e52f49bc88e15972bf41e3dc501fdbf7968&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fauth%2Fintra&response_type=code";

var GAME_RUNNING = false;
var TOURNAMENT_ID = 0;
var PLAYER1 = "";
var PLAYER2 = "";
var WINNER = "";
var GAME_MODE = "";
var BRACKET = "";
var payload = null;

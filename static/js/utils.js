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

const BASE_URL = window.location.protocol + "//" + window.location.host;
var GAME_RUNNING = false;

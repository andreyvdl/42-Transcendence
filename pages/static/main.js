window.addEventListener("DOMContentLoaded", () => {
	handleLocation();
	window.onpopstate = handleLocation;

    document.querySelectorAll('a.nav-link').forEach(link => {
		link.addEventListener('click', route);
	});
});

const handleLocation = async () => {
	const currLocation = window.location.pathname;
	await fetch(currLocation, {
		headers : {
			'Accept': 'text/html',
			'X-Requested-With': 'XMLHttpRequest',
		},
	})
	.then(response => {
		if (!response.ok)
			return new Error(response.status)
		return response.text()
	})
	.then(html => {
		document.getElementById("mainContent").innerHTML = html;
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

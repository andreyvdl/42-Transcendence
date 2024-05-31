window.addEventListener("DOMContentLoaded", () => {
	handleLocation();
	window.onpopstate = handleLocation;

    const navLinks = document.querySelectorAll('a.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', route);
    });
})

const route = (event) => {
    event.preventDefault();

	const targetUrl = event.target.href;
	const currentUrl = window.location.href;

	if (targetUrl != currentUrl)
		window.history.pushState({}, "", event.target.href);
    handleLocation();
};

const handleLocation = async () => {
	const route = window.location.pathname;
	const html = await fetch(route, {
		headers:{
			'Accept': 'application/json',
			'X-Requested-With': 'XMLHttpRequest',
		},
	})
	.then((data) => data.text());
	console.log(html);
	document.getElementById("mainContent").innerHTML = html;
};

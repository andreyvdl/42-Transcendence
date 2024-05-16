window.addEventListener('hashchange', () => {
	console.log('hashchange', location.hash);
});

document.querySelector('#formContainer').addEventListener('submit', (event) => {
	event.preventDefault();
	const formData = new FormData(event.target);
	const data = Object.fromEntries(formData.entries());
	console.log(data);
});

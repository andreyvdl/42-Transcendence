window.addEventListener('hashchange', () => {
	console.log('hashchange', location.hash);
});

const socket = new WebSocket('ws://localhost:8000/ws');

socket.onopen = function (event) {
	console.log('Connected to WebSocket Server');
}

socket.onmessage = function (event) {
	const data = JSON.parse(event.data);
}

socket.onclose = function (event) {
	console.log('Disconnected from WebSocket server');
}

document.querySelector('#formContainer').addEventListener('submit', (event) => {
	event.preventDefault();
	const formData = new FormData(event.target);
	const data = Object.fromEntries(formData.entries());
	const jsonData = JSON.stringify({ email: data.email, password: data.password});

	socket.send(jsonData);
});

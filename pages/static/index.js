console.log("loading index.js")

window.addEventListener('DOMContentLoaded', () => {
	const socket = new WebSocket("wss://0.0.0.0:8001/wss/");

	socket.onopen = function (event) {
		console.log('Connected to Login WebSocket Server');
	}

	socket.onmessage = function (event) {
		console.log("Message sent by the server:")
		console.log(JSON.parse(event.data))
	}

	socket.onclose = function (event) {
		console.log('Disconnected from WebSocket server');
	}

	document.querySelector('#formContainer').addEventListener('submit', (event) => {
		event.preventDefault();
		const email = document.getElementById('email_input').value
		const password = document.getElementById('pass_input').value
		socket.send(JSON.stringify({
			'email': email,
			'password': password,
		}));
	});
})

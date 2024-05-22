window.addEventListener('hashchange', () => {
	console.log('hashchange', location.hash);
});

window.addEventListener('DOMContentLoaded', () => {
	const loginSocket = new WebSocket('wss://localhost:5000/wss/login/');
	const registerSocket = new WebSocket('wss://localhost:5000/wss/register/');

	loginSocket.onopen = function (event) {
		console.log('Connected to Login WebSocket Server');
	}
	registerSocket.onopen = function (event) {
		console.log('Connected to Register WebSocket Server');
	}

	loginSocket.onmessage = registerSocket.onmessage = function (event) {
		console.log("Message sent by the server:")
		console.log(JSON.parse(event.data))
	}

	loginSocket.onclose = registerSocket.onclose = function (event) {
		console.log('Disconnected from WebSocket server');
	}

	document.querySelector('#formContainer').addEventListener('submit', (event) => {
		event.preventDefault();
		const email = document.getElementById('email_input').value
		const password = document.getElementById('pass_input').value
		loginSocket.send(JSON.stringify({
			'email': email,
			'password': password,
		}));
	});

	// document.querySelector('#formContainer').addEventListener('submit', (event) => {
	// 	event.preventDefault();
	// 	const email = document.getElementById('email_input').value
	// 	const password = document.getElementById('pass_input').value
	// 	registerSocket.send(JSON.stringify({
	// 		'email': email,
	// 		'password': password,
	// 	}));
	// });

})

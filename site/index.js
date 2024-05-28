window.addEventListener('DOMContentLoaded', () => {
	var socket = new WebSocket("wss://localhost:5000/wss/page");

	var path = window.location.pathname;

	socket.onopen = function() {
		if (path === "/") {
			socket.send(JSON.stringify({ 'type' : 'home' }));
		} else if (path === "/login") {
			socket.send(JSON.stringify({ 'type' : 'login' }));
		} else if (path === "/register") {
			socket.send(JSON.stringify({ 'type' : 'register' }));
		}
	}

	socket.onmessage = function(event) {
		document.getElementById("mainContent").innerHTML = event.data;
	}
})

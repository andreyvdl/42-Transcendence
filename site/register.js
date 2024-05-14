const socket = new WebSocket('ws://localhost:3000/site');

socket.onmessage = event => {
	const data = JSON.parse(event.data);

	console.log(data);
};

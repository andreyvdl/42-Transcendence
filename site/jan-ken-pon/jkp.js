const ESCOLHAS = {pedra: 0, papel: 1, tesoura: 2}
const JOGADOR = [{escolha: -1, pontos: 0}, {escolha: -1, pontos: 0}];
const TECLAS = {};
var TEMPO = 3;
var TEMPORIZADOR = false;
let QUADRO = document.getElementById("jogo");
let CTX = QUADRO.getContext("2d");

document.addEventListener("keydown", (event) => {
	TECLAS[event.key] = true;
});

document.addEventListener("keyup", (event) => {
	TECLAS[event.key] = false;
});

window.onresize = () => {
	QUADRO.setAttribute("width", window.innerWidth);
	QUADRO.setAttribute("height", window.innerHeight);
}

function updatePlayers() {
	console.log("JOGAS");
	console.log(JOGADOR);
	if (TECLAS["a"])
		JOGADOR[0].escolha = ESCOLHAS.pedra;
	if (TECLAS["s"])
		JOGADOR[0].escolha = ESCOLHAS.papel;
	if (TECLAS["d"])
		JOGADOR[0].escolha = ESCOLHAS.tesoura;
	if (TECLAS["j"])
		JOGADOR[1].escolha = ESCOLHAS.pedra;
	if (TECLAS["k"])
		JOGADOR[1].escolha = ESCOLHAS.papel;
	if (TECLAS["l"])
		JOGADOR[1].escolha = ESCOLHAS.tesoura;
}

function timer() {
	TEMPO = 3;
	TEMPORIZADOR = true;
	let tempo = setInterval(() => {
		TEMPO--;
		if (TEMPO < 0) {
			clearInterval(tempo);
			TEMPORIZADOR = false;
		}
	}, 1000);
}

function drawText() {
	CTX.textAlign = "center";
	CTX.textBaseline = "middle";
	CTX.font = "50px arial";
	CTX.fillStyle = "red";
	CTX.fillText(TEMPO.toString(), QUADRO.width / 2, 50);
}

function drawPlayers() {
	CTX.fillStyle = "blue";
	CTX.fillRect(0, 0, QUADRO.width / 2, QUADRO.height);
	CTX.fillStyle = "green";
	CTX.fillRect(QUADRO.width / 2, 0, QUADRO.width, QUADRO.height);
}

function updatePlayers() {
	if (TEMPO != 0)
		return;
	if (JOGADOR[0].escolha == -1)
		JOGADOR[0].escolha = Math.random() * 3 | 0;
	if (JOGADOR[1].escolha == -1)
		JOGADOR[1].escolha = Math.random() * 3 | 0;
	switch (JOGADOR[0].escolha) {
		case 0:
			if (JOGADOR[1].escolha == 0)
				alert("pedra vs pedra = empate");
			else if (JOGADOR[1].escolha == 1) {
				alert("pedra vs papel = Jogador 2 ganhou");
				JOGADOR[1].pontos++;
			}
			else if (JOGADOR[1].escolha == 2) {
				alert("pedra vs tesoura = Jogador 1 ganhou");
				JOGADOR[0].pontos++;
			}
		break;
		case 1:
			if (JOGADOR[1].escolha == 0) {
				alert("papel vs pedra = Jogador 1 ganhou");
				JOGADOR[0].pontos++;
			}
			else if (JOGADOR[1].escolha == 1)
				alert("papel vs papel = empate");
			else if (JOGADOR[1].escolha == 2) {
				alert("papel vs tesoura = Jogador 2 ganhou");
				JOGADOR[1].pontos++;
			}
		break;
		default:
			if (JOGADOR[1].escolha == 0) {
				alert("tesoura vs pedra = Jogador 2 ganhou");
				JOGADOR[1].pontos++;
			}
			else if (JOGADOR[1].escolha == 1) {
				alert("tesoura vs papel = Jogador 1 ganhou");
				JOGADOR[0].pontos++;
			}
			else if (JOGADOR[1].escolha == 2)
				alert("tesoura vs tesoura = empate");
		break;
	}
}

function draw() {
	CTX.clearRect(0, 0, QUADRO.width, QUADRO.height);
	drawPlayers();
	drawText();
	if (TEMPORIZADOR == false)
		timer();
	updatePlayers();
	requestAnimationFrame(draw);
}

console.log(JOGADOR);
QUADRO.setAttribute("width", window.innerWidth);
QUADRO.setAttribute("height", window.innerHeight);
draw();

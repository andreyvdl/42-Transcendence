const ESCOLHAS = {
	pedra: 0,
	papel: 1,
	tesoura: 2
};

const JOGADOR = [
	{ escolha: -1, pontos: 0 },
	{ escolha: -1, pontos: 0 }
];

const RESULTADOS = [
	[0, 1, -1],
	[-1, 0, 1],
	[1, -1, 0]
];

const IMAGENS = {
	fogo: new Image(),
	agua: new Image(),
	neve: new Image(),
	questao: new Image()
};

var g_tempo = 5;
var g_temporizador = false;
var g_imagens = false;
var g_resultados = false;
var quadro = document.getElementById("jogo");
var contexto = quadro.getContext("2d");

quadro.setAttribute("width", window.innerWidth);
quadro.setAttribute("height", window.innerHeight);

IMAGENS.fogo.src = "./assets/fire.png";
IMAGENS.agua.src = "./assets/water.png";
IMAGENS.neve.src = "./assets/snow.png";
IMAGENS.questao.src = "./assets/question.png";

function timer() {
	if (g_temporizador) return;
	g_temporizador = true;
	let intervalo = setInterval(() => {
		g_tempo--;
		if (g_tempo < 0) {
			clearInterval(intervalo);
			g_resultados = true;
			g_tempo = 0;
		}
	}, 1000);
}

function desenharEscolhas() {
	if (!g_imagens) {
		contexto.drawImage(
			IMAGENS.questao,
			quadro.width / 4 - IMAGENS.questao.width / 2,
			quadro.height / 2 - IMAGENS.questao.height / 2,
		);
		contexto.drawImage(
			IMAGENS.questao,
			quadro.width / 4 * 3 - IMAGENS.questao.width / 2,
			quadro.height / 2 - IMAGENS.questao.height / 2,
		);
		return
	}
	const img = [IMAGENS.fogo, IMAGENS.agua, IMAGENS.neve][JOGADOR[0].escolha];

	contexto.drawImage(
		img,
		quadro.width / 4 - img.width / 2,
		quadro.height / 2 - img.height / 2,
	);
	
	const img2 = [IMAGENS.fogo, IMAGENS.agua, IMAGENS.neve][JOGADOR[1].escolha];
	
	contexto.drawImage(
		img2,
		quadro.width / 4 * 3 - IMAGENS.fogo.width / 2,
		quadro.height / 2 - IMAGENS.fogo.height / 2,
	);
}

function checarJogadores() {
	if (g_resultados) {
		if (JOGADOR[0].escolha == -1) JOGADOR[0].escolha = gerarAleatorio();
		if (JOGADOR[1].escolha == -1) JOGADOR[1].escolha = gerarAleatorio();
		switch (RESULTADOS[JOGADOR[0].escolha][JOGADOR[1].escolha]) {
			case -1:
				JOGADOR[0].pontos++;
				break;
			case 1:
				JOGADOR[1].pontos++;
				break;
			default: break;
		}
		g_imagens = true;
		g_resultados = false;
		setTimeout(() => {
				g_tempo = 5;
				JOGADOR[0].escolha = -1;
				JOGADOR[1].escolha = -1;
				g_temporizador = false;
				g_imagens = false;
			}, 3000
		);
	}
}

function renderizador() {
	contexto.clearRect(0, 0, quadro.width, quadro.height);
	contexto.textAlign = "center";
	contexto.textBaseline = "middle";
	contexto.font = "72px arial";
	timer();
	desenharLados();
	desenharTexto();
	checarJogadores();
	desenharEscolhas();
	requestAnimationFrame(renderizador);
}

function desenharLados() {
	contexto.fillStyle = "#009dff";
	contexto.fillRect(0, 0, quadro.width / 2, quadro.height);
	contexto.fillStyle = "#ff9400";
	contexto.fillText(JOGADOR[0].pontos.toString(), quadro.width / 4, 73);
	contexto.strokeText(JOGADOR[0].pontos.toString(), quadro.width / 4, 73);
	contexto.fillStyle = "#fffc00";
	contexto.fillRect(quadro.width / 2, 0, quadro.width, quadro.height);
	contexto.fillStyle = "#7200ff";
	contexto.fillText(JOGADOR[1].pontos.toString(), quadro.width / 4 * 3, 73);
	contexto.strokeText(JOGADOR[1].pontos.toString(), quadro.width / 4 * 3, 73);
}

function desenharTexto() {
	contexto.fillStyle = "#ff0000";
	contexto.fillText(g_tempo.toString(), quadro.width / 2, 73);
	contexto.strokeText(g_tempo.toString(), quadro.width / 2, 73);
}

function gerarAleatorio() {
	return Math.floor(Math.random() * 3);
}

document.addEventListener("keydown", (event) => {
	if (!g_imagens) {
		if (event.key == "a") JOGADOR[0].escolha = ESCOLHAS.pedra;
		if (event.key == "s") JOGADOR[0].escolha = ESCOLHAS.papel;
		if (event.key == "d") JOGADOR[0].escolha = ESCOLHAS.tesoura;
		if (event.key == "j") JOGADOR[1].escolha = ESCOLHAS.pedra;
		if (event.key == "k") JOGADOR[1].escolha = ESCOLHAS.papel;
		if (event.key == "l") JOGADOR[1].escolha = ESCOLHAS.tesoura;
	}
});

window.onresize = () => {
	quadro.setAttribute("width", window.innerWidth);
	quadro.setAttribute("height", window.innerHeight);
	g_ratio = window.innerWidth / window.innerHeight;
};

alert("TUTORIAL\n\
Jogador 1: teclas 'a', 's' e 'd'\n\
Jogador 2: teclas 'j', 'k' e 'l'\n\
Vocês tem 5 segundo para escolher fogo, água ou gelo\n\
fogo > gelo > água > fogo\n\
Se um dos jogadores não escolher a tempo, será escolhido aleatoriamente");
renderizador();

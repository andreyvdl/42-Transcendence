import { saveMatchResult } from "../save-match.js";

function jkpGameInit() {
	GAME_RUNNING = true;
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

	const assetsPath = "/static/assets/jkp-game/"
	IMAGENS.fogo.src = `${assetsPath}fire.png`;
	IMAGENS.agua.src = `${assetsPath}water.png`;
	IMAGENS.neve.src = `${assetsPath}snow.png`;
	IMAGENS.questao.src = `${assetsPath}question.png`;

	function timer() {
		if (g_temporizador) return;
		g_tempo = 5;
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
				JOGADOR[0].escolha = -1;
				JOGADOR[1].escolha = -1;
				g_temporizador = false;
				g_imagens = false;
			}, 3000
			);
			if (JOGADOR[0].pontos == 2 || JOGADOR[1].pontos == 2) {
				GAME_RUNNING = false;
			}
		}
	}

    function matchResult() {
        return {
            game: "jkp",
            gameMode: GAME_MODE,
            bracket: BRACKET,
            scores: {p1: JOGADOR[0].pontos, p2: JOGADOR[1].pontos},
            winner: WINNER,
            player1: PLAYER1,
            player2: PLAYER2
        };
    }

	function renderizador() {
		if (!GAME_RUNNING) {
			window.onresize = null;

            if (JOGADOR[0].pontos > JOGADOR[1].pontos) {
                WINNER = PLAYER1;
                alert("Jogador 1 venceu");
            }
            else {
                WINNER = PLAYER2;
                alert("Jogador 2 venceu");
            }

            // DEBUG
            console.log(`MATCH WINNER: ${WINNER}`)

            const match = matchResult()
            saveMatchResult(match)
            if (GAME_MODE != "tournament")
                handleRedirect('/home/');
			return;
		}
		contexto.clearRect(0, 0, quadro.width, quadro.height);
		contexto.textAlign = "center";
		contexto.textBaseline = "middle";
		contexto.font = "72px arial";
		timer();
		desenharPlacar()
		checarJogadores();
		desenharEscolhas();
		requestAnimationFrame(renderizador);
	}

	function desenharPlacar() {
		scoreboard = document.getElementById('scoreboard');
		scoreboard.innerHTML = `${JOGADOR[0].pontos}x${JOGADOR[1].pontos}:${g_tempo}`;
	}

	function gerarAleatorio() {
		return Math.floor(Math.random() * 3);
	}

	document.addEventListener("keydown", (event) => {
		if (!g_imagens) {
			if (event.key == "a") JOGADOR[0].escolha = ESCOLHAS.pedra;
			if (event.key == "s") JOGADOR[0].escolha = ESCOLHAS.papel;
			if (event.key == "d") JOGADOR[0].escolha = ESCOLHAS.tesoura;
			if (GAME_MODE === "pve") return ;
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

    // DEBUG
    console.log(`GAME MODE: ${GAME_MODE}, MATCH: ${PLAYER1} x ${PLAYER2}`)

	alert("TUTORIAL\n\
Jogador 1: 'a' = 🔥, 's' = 💧 e 'd' = ❄️\n\
Jogador 2: 'j' = 🔥, 'k' = 💧 e 'l' = ❄️\n\
Vocês tem 5 segundos para escolher 🔥, 💧 ou ❄️\n\
🔥 > ❄️ > 💧 > 🔥\n\
Se um dos jogadores não escolher a tempo, será escolhido aleatoriamente");
	renderizador();
}

export default function jkpGamePageSetup() {
    jkpGameInit();
}

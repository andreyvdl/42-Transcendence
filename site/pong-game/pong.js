let board;
let context;

const BOARD_WIDTH = 800;
const BOARD_HEIGHT = 800;

const LIMIT_MOVE_UP = 30;
const LIMIT_MOVE_DOWN = BOARD_HEIGHT - LIMIT_MOVE_UP;

const DEFAULT_PLAYER_WIDTH = 10;
const DEFAULT_PLAYER_HEIGHT = 100;
const DEFAULT_PLAYER_SPEED = 15;

const DEFAULT_BALL_WIDTH = 12;
const DEFAULT_BALL_HEIGHT = 12;
const DEFAULT_BALL_VELOCITY_X = 2;
const DEFAULT_BALL_VELOCITY_Y = 2;
const SPEED_INCREMENT = 1.1; // 1.00 - 2.00
const MAX_BALL_SPEED = 5;

class Player {
    constructor (x, y) {
        this._x = x;
        this._y = y;
        this._width = DEFAULT_PLAYER_WIDTH;
        this._height = DEFAULT_PLAYER_HEIGHT;
        this._playerScore = 0;
    }
    
    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    get playerScore() {
        return this._playerScore;
    }

    set playerScore(playerScore) {
        this._playerScore = playerScore;
    }

    moveUp() {
        if (this._y - DEFAULT_PLAYER_SPEED < LIMIT_MOVE_UP)
            return ;
        this._y -= DEFAULT_PLAYER_SPEED;
    }

    moveDown() {
        if (this._y + this._height + DEFAULT_PLAYER_SPEED > LIMIT_MOVE_DOWN)
            return ;
        this._y += DEFAULT_PLAYER_SPEED;
    }
}

let ball = {
	x : BOARD_WIDTH / 2,
	y : getRandomInt((BOARD_HEIGHT / 2) / 2, BOARD_HEIGHT - (BOARD_HEIGHT / 2) / 2),
	width : DEFAULT_BALL_WIDTH,
	height : DEFAULT_BALL_HEIGHT, 
	velocityX : DEFAULT_BALL_VELOCITY_X,
	velocityY : DEFAULT_BALL_VELOCITY_Y,
}

let playerOne = new Player(10, BOARD_HEIGHT/2);
let playerTwo = new Player(BOARD_WIDTH - 20, BOARD_HEIGHT/2);

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}

function restartGame() {
	ball.x = BOARD_WIDTH / 2;
	ball.y = getRandomInt((BOARD_HEIGHT / 2) / 2, BOARD_HEIGHT - (BOARD_HEIGHT / 2) / 2);
	ball.velocityX = DEFAULT_BALL_VELOCITY_X;
	ball.velocityY = DEFAULT_BALL_VELOCITY_Y;
	if (ball.y % 2 == 0) {
		ball.velocityY = DEFAULT_BALL_VELOCITY_Y * -1;
	} else {
		ball.velocityX = DEFAULT_BALL_VELOCITY_X * -1;
	}
}

function detectCollision(a, b) {
    return (a.x < b.x + b.width && a.x + a.width > b.x &&
        a.y < b.y + b.height && a.y + a.height > b.y);
}

var hitted = false;
var checked = 0;

function updateBall() {
	ball.x += ball.velocityX;
	ball.y += ball.velocityY;
	if (ball.y < 0 || (ball.y + ball.height > BOARD_HEIGHT)) {
		ball.velocityY *= -1;
		ball.velocityY *= (Math.abs(ball.velocityY) < MAX_BALL_SPEED ? SPEED_INCREMENT : 1);
	}
	if (hitted === true && checked <= 100) {
		checked++;
		return ;
	}
	else {
		hitted = false;
		checked = 0;
	}
    if (detectCollision(ball, playerOne) && ball.x > playerOne.x) {
        if (ball.x < playerOne.x + playerTwo.height) {
            ball.velocityX *= -1;
			ball.velocityX *= (Math.abs(ball.velocityX) < MAX_BALL_SPEED ? SPEED_INCREMENT : 1);
			hitted = true;
		}
    } else if (detectCollision(ball, playerTwo) && ball.x < playerTwo.x) {
        if (ball.x < playerTwo.x + playerTwo.height) {
            ball.velocityX *= -1;
			ball.velocityX *= (Math.abs(ball.velocityX) < MAX_BALL_SPEED ? SPEED_INCREMENT : 1);
			hitted = true;
		}
    }
}

function update() {
    requestAnimationFrame(update)
    context.clearRect(0, 0, board.width, board.height)

    // LINE CENTER
    context.fillStyle = "white";
    for (let i = 10; i < board.height; i += 25) {
        context.fillRect(board.width / 2 - 10, i, 5, 5);
    }

    // PLAYERS
    context.fillRect(playerOne.x, playerOne.y, playerOne.width, playerOne.height);
    context.fillRect(playerTwo.x, playerTwo.y, playerTwo.width, playerTwo.height);

    // BALL
    context.fillStyle = "grey"
	updateBall();
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    //SCORE
    if (ball.x + ball.width >= board.width) {
        playerOne.playerScore++;
		restartGame();
    } else if (ball.x + ball.width <= 0) {
        playerTwo.playerScore++;
		restartGame();
    }
    context.fillStyle = "white";
    context.font = "45px arial";
    context.fillText(playerOne.playerScore, board.width / 5, 45);
    context.fillText(playerTwo.playerScore, board.width * 4 / 5 - 45, 45);
}

function movePlayer(e) {
    if (e.code == "KeyW")
        playerOne.moveUp();
    else if (e.code == "KeyS")
        playerOne.moveDown();
    if (e.code == "ArrowUp")
        playerTwo.moveUp();
    else if (e.code == "ArrowDown")
        playerTwo.moveDown();
}

window.onload = function() {
    board = document.getElementById("board");
    board.height = BOARD_HEIGHT;
    board.width = BOARD_WIDTH;
    context = board.getContext("2d");

    document.addEventListener("keyup", movePlayer);
    document.addEventListener("keydown", movePlayer);
    document.addEventListener("w", movePlayer);
    document.addEventListener("s", movePlayer);

    requestAnimationFrame(update);
}

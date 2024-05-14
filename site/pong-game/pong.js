let board;
let context;
const boardWidth = 800;
const boardHeight = 800;

const limitMoveUp = 30;
const limitMoveDown = boardHeight - limitMoveUp;

const playerWidth = 10;
const playerHeight = 100;
const playerSpeed = 15;

class Player {
    constructor (x, y) {
        this._x = x;
        this._y = y;
        this._width = playerWidth;
        this._height = playerHeight;
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
        if (this._y - playerSpeed < limitMoveUp)
            return ;
        this._y -= playerSpeed;
    }

    moveDown() {
        if (this._y + this._height + playerSpeed > limitMoveDown)
            return ;
        this._y += playerSpeed;
    }
}

const defaultBallWidth = 12;
const defaultBallHeight = 12;
const defaultBallVelocityX = 2;
const defaultBallVelocityY = 2;
const speedIncrement = 1.1; // 1.00 - 2.00

let ball = {
	x : boardWidth / 2,
	y : getRandomInt((boardHeight / 2) / 2, boardHeight - (boardHeight / 2) / 2),
	width : defaultBallWidth,
	height : defaultBallHeight, 
	velocityX : defaultBallVelocityX,
	velocityY : defaultBallVelocityY,
}

let playerOne = new Player(10, boardHeight/2, playerWidth, playerHeight);
let playerTwo = new Player(boardWidth - 20, boardHeight/2, playerWidth, playerHeight);

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}

function restartGame() {
	ball.x = boardWidth / 2;
	ball.y = getRandomInt((boardHeight / 2) / 2, boardHeight - (boardHeight / 2) / 2);
	ball.velocityX = defaultBallVelocityX;
	ball.velocityY = defaultBallVelocityY;
	if (ball.y % 2 == 0) {
		ball.velocityY = defaultBallVelocityY * -1;
	} else {
		ball.velocityX = defaultBallVelocityX * -1;
	}
}

function detectCollision(a, b) {
    return (a.x < b.x + b.width && a.x + a.width > b.x &&
        a.y < b.y + b.height && a.y + a.height > b.y);
}

function updateBall() {
	ball.x += ball.velocityX;
	ball.y += ball.velocityY;
	if (ball.y < 0 || (ball.y + ball.height > boardHeight)) {
		ball.velocityY *= -speedIncrement;
	}
    if (detectCollision(ball, playerOne) && ball.x > playerOne.x) {
        if (ball.x < playerOne.x + playerTwo.height)
            ball.velocityX *= -speedIncrement;
    } else if (detectCollision(ball, playerTwo) && ball.x < playerTwo.x) {
        if (ball.x < playerTwo.x + playerTwo.height)
            ball.velocityX *= -speedIncrement;
    }
}

function update() {
    requestAnimationFrame(update)
    context.clearRect(0, 0, board.width, board.height)

    // LINE CENTER
    context.fillStyle = "white";
    for (let i = 10; i < boardHeight; i += 25) {
        context.fillRect(boardWidth/2 - 10, i, 5, 5);
    }

    // PLAYERS
    context.fillRect(playerOne.x, playerOne.y, playerOne.width, playerOne.height);
    context.fillRect(playerTwo.x, playerTwo.y, playerTwo.width, playerTwo.height);

    // BALL
    context.fillStyle = "grey"
	updateBall();
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    //SCORE
    if (ball.x + ball.width >= boardWidth) {
        playerOne.playerScore++;
		restartGame();
    } else if (ball.x + ball.width <= 0) {
        playerTwo.playerScore++;
		restartGame();
    }
    context.fillStyle = "white";
    context.font = "45px arial";
    context.fillText(playerOne.playerScore, boardWidth/5, 45);
    context.fillText(playerTwo.playerScore, boardWidth*4/5 - 45, 45);
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
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    document.addEventListener("keyup", movePlayer);
    document.addEventListener("keydown", movePlayer);
    document.addEventListener("w", movePlayer);
    document.addEventListener("s", movePlayer);

    requestAnimationFrame(update);
}

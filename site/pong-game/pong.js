let board;
let context;
const boardWidth = 800;
const boardHeight = 800;

const limitMoveUp = 30;
const limitMoveDown = boardHeight - limitMoveUp;

const playerWidth = 10;
const playerHeight = 80;
const playerSpeed = 9;

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

const ballWidth = 12;
const ballHeight = 12;
const defaultBallVelocityX = 1;
const defaultBallVelocityY = 2;

class Ball {
    constructor(x, y) {
        this._x = x;
        this._y = y;
        this._width = ballWidth;
        this._height = ballHeight;
        this._ballVelocityX = defaultBallVelocityX;
        this._ballVelocityY = defaultBallVelocityY;
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

    reset(direction) {
        this._x = boardWidth/2
        this._y = Math.floor(Math.random() * boardHeight + 1);
        this._ballVelocityX = defaultBallVelocityX * direction;
        this._ballVelocityY = defaultBallVelocityY * direction;
    }

    move() {
        this._x += this._ballVelocityX;
        this._y += this._ballVelocityY;
        if (this._y < 0 || (this._y + this._height > boardHeight)) {
            this._ballVelocityY *= -1;
        }
    }
}

let playerOne = new Player(10, boardHeight/2, playerWidth, playerHeight);
let playerTwo = new Player(boardWidth - 20, boardHeight/2, playerWidth, playerHeight);
let ball = new Ball(boardWidth/2, boardHeight/2)

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
    ball.move();
    if (detectCollision(ball, playerOne)) {
        if (ball.x > playerOne.x && ball.x < playerOne.x + playerTwo.height)
            ball._ballVelocityX *= -1;
    } else if (detectCollision(ball, playerTwo)) {
        if (ball.x < playerTwo.x && ball.x < playerTwo.x + playerTwo.height)
            ball._ballVelocityX *= -1;
    }
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    //SCORE
    if (ball.x + ball.width >= boardWidth) {
        playerOne.playerScore++;
        ball.reset(1);
    } else if (ball.x + ball.width <= 0) {
        playerTwo.playerScore++;
        ball.reset(-1);
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

function detectCollision(a, b) {
    return (a.x < b.x + b.width && a.x + a.width > b.x &&
        a.y < b.y + b.height && a.y + a.height > b.y);
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
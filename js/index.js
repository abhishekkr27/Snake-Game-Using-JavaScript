//     <!-- GAME JAVASCRIPT -->

// Environment variables.
// This code is only executed once.
var GRID_HEIGHT = 40; // = 600 / 15
var GRID_WIDTH = 60; // = 900 / 15
var BLOCK_SIZE = 15;
// Accesses the correct COL_CHANGE and ROW_CHANGE
var DIRECTIONS = {
    up: 0,
    right: 1,
    down: 2,
    left: 3
}
/*
        0
    3       1
        2
*/
var COL_CHANGE = [0, 1, 0, -1];
var ROW_CHANGE = [-1, 0, 1, 0];
                //slow, med, fast
var GAME_SPEEDS = [
    {name: "Slow", speed: 200},
    {name: "Medium", speed: 140},
    {name: "Fast", speed: 80}
];
var SNAKE_DIRECTION = DIRECTIONS["up"];
var IS_DYING = false;
var IS_EATING = false;
var CURRENT_GAME_SPEED = GAME_SPEEDS[1]; // Set to Medium
var HIGH_SCORE = 0;
var PLAY_GAME = false;
var PAUSE_FOR_DEATH = false;
var GAME_LOOP;

var gameScore = 0;

// Get the snakeGrid and other elements so we can
// dynamically change them throughout the game.
var gameGrid = document.getElementById("snakeGrid");
var scoreText = document.getElementById("score");
var playButton = document.getElementById("do-play");
var highScoreText = document.getElementById("high-score");
var gameSpeedButton = document.getElementById("game-speed");

// Handle user input
document.onkeydown = checkKey;
function checkKey(e) {
    e = e || window.event;

    if (e.keyCode == '38') {
        // up arrow
        SNAKE_DIRECTION = DIRECTIONS["up"];
    } else if (e.keyCode == '40') {
        // down arrow
        SNAKE_DIRECTION = DIRECTIONS["down"];
    } else if (e.keyCode == '37') {
        // left arrow
        SNAKE_DIRECTION = DIRECTIONS["left"];
    } else if (e.keyCode == '39') {
        // right arrow
        SNAKE_DIRECTION = DIRECTIONS["right"];
    }
}

var snake = [];

var snakeHead = new SnakePiece(20, 30);
snake.push(new SnakePiece(20, 31));
snake.push(new SnakePiece(20, 32));
snake.push(new SnakePiece(20, 33));
snake.push(new SnakePiece(20, 34));

var foods = [];
foods.push(new FoodPiece());
foods.push(new FoodPiece());
foods.push(new FoodPiece());

// the shift() and unshift() functions let you use a javascript array as a queue.
snake.push(snakeHead);

// Will execute function() every CURRENT_GAME_SPEED.speed milliseconds
function play() {
    GAME_LOOP = setInterval(function () {

        ///////////////////////// Main Game Loop //////////////////////

        // Move the snake one space in it's current direction.
        snake.unshift(new SnakePiece(snake[0].row + ROW_CHANGE[SNAKE_DIRECTION], snake[0].col + COL_CHANGE[SNAKE_DIRECTION]));

        IS_EATING = isEating();
        if (IS_EATING) {
            gameScore = gameScore + 1;
            console.log("YOU ATE A FOOD");
        }
        // move tail of snake
        if (!IS_EATING) {
            gameGrid.removeChild(snake.pop().el);
        }

        IS_DYING = isDying();
        if (IS_DYING) {
            // The snake collided with a wall or with itself.
            PLAY_GAME = false;
            handleDeath();
            console.log("YOU'VE DIED");
        }

        // End of cycle logic.
        IS_EATING = false;
        IS_DYING = false;

        console.log(SNAKE_DIRECTION);
        // console.log(foods);
        scoreText.innerText = "Your Score: " + gameScore;
        if(!PAUSE_FOR_DEATH) {
            playButton.innerText = PLAY_GAME ? "End Game" : "Play Game";
        }

        // Spawn more foods if they're all gone.
        if (foods.length < 1) {
            foods.push(new FoodPiece());
            foods.push(new FoodPiece());
            foods.push(new FoodPiece());
        }
    }, CURRENT_GAME_SPEED.speed);
}

/*
 * EVENT HANDLER FUNCTIONS
 */

function handleToggleGamePlay() {
    PLAY_GAME = !PLAY_GAME;
    console.log("PLAY_GAME ?: ",PLAY_GAME);
    if(PLAY_GAME) {
        play();
    } else {
        clearInterval(GAME_LOOP);
    }
}

function handleChangeGameSpeed() {
    if (!PLAY_GAME) {
        // We can only change the game speed while a game is not going
        var currentSpeedIndex = GAME_SPEEDS.indexOf(CURRENT_GAME_SPEED);
        var nextSpeedIndex = (currentSpeedIndex < GAME_SPEEDS.length - 1) ? (currentSpeedIndex + 1) : 0;
        CURRENT_GAME_SPEED = GAME_SPEEDS[nextSpeedIndex];
        console.log("updated game speed:",CURRENT_GAME_SPEED)
        gameSpeedButton.innerText = GAME_SPEEDS[nextSpeedIndex].name;
    }
}

function handleDeath() {

    // Stop the game loop and reset/update the scores
    clearInterval(GAME_LOOP);
    var highScore = Math.max(HIGH_SCORE, gameScore);
    highScoreText.innerText = "Your High Score: " + highScore;
    gameScore = 0;

    // Show the death message
    playButton.classList.remove('fuchsia');
    playButton.classList.add('red');
    PAUSE_FOR_DEATH = true;
    playButton.innerText = "You Have Died";

    // Delete the current snake
    while(snake[0]) {
        gameGrid.removeChild(snake.pop().el);
    }

    // Wait for a second, then reinitialize the snake
    setTimeout(function(){
        playButton.innerText = "Play Game";
        playButton.classList.remove('red');
        playButton.classList.add('fuchsia');
        // Initialize a new snake
        snakeHead = new SnakePiece(20, 30);
        snake.push(new SnakePiece(20, 31));
        snake.push(new SnakePiece(20, 32));
        snake.push(new SnakePiece(20, 33));
        snake.push(new SnakePiece(20, 34));
        snake.push(snakeHead);
        PAUSE_FOR_DEATH = false;
    },1500);
}

/*
    CONSTRUCTOR FUNCTIONS
*/

// Constructor for a new snake piece.
function SnakePiece(row, col) {

    var mySnakePieceElement = document.createElement("div");
    mySnakePieceElement.className = "snake";
    mySnakePieceElement.style.top = (row * BLOCK_SIZE) + "px";
    mySnakePieceElement.style.left = (col * BLOCK_SIZE) + "px";
    gameGrid.appendChild(mySnakePieceElement);

    // curRow and curCol are declared inside the function,
    // so the calling code can't use it. It's javascript's
    // version of a private variable.
    //var curRow = row;
    //var curCol = col;

    this.col = col;
    this.row = row;
    this.el = mySnakePieceElement;

    //this.movePiece = function() {
    //    this.col += COL_CHANGE[SNAKE_DIRECTION];
    //    this.row += ROW_CHANGE[SNAKE_DIRECTION];
    //    this.el.style.top = (this.row * BLOCK_SIZE) + "px";
    //    this.el.style.left = (this.col * BLOCK_SIZE) + "px";
    //}
}

// Constructor for a new food piece.
function FoodPiece() {
    var col = getRandomInt(0, GRID_WIDTH - 1);
    var row = getRandomInt(0, GRID_HEIGHT - 1);

    var myFoodElement = document.createElement("div");
    myFoodElement.className = "food";
    myFoodElement.style.top = (row * BLOCK_SIZE) + "px";
    myFoodElement.style.left = (col * BLOCK_SIZE) + "px";
    gameGrid.appendChild(myFoodElement);

    this.col = col;
    this.row = row;
    this.el = myFoodElement;
}

function isDying() {
    // hits wall
    var head = snake[0];
    if (head.row < 0 || head.row >= GRID_HEIGHT || head.col < 0 || head.col >= GRID_WIDTH) {
        return true;
    }
    // collides with self
    var i;
    for (i = 1; i < snake.length; i++) {
        var curPiece = snake[i];
        // === is more explicit. It demands that datatypes be the same.
        // == would return true with '1' == 1, for example.
        if (head.row === curPiece.row && head.col === curPiece.col) {
            return true;
        }
    }
    return false;
}

function isEating() {
    // eats food
    var head = snake[0];
    var i;
    for (i = 0; i < foods.length; i++) {
        var curPiece = foods[i];
        if (head.row === curPiece.row && head.col === curPiece.col) {
            // Gets rid of food i (since its been eaten)
            foods.splice(i, 1);
            gameGrid.removeChild(curPiece.el);
            return true;
        }
    }
    return false;
}

/*
    UTILITY FUNCTIONS
*/

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

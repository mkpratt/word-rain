import { GameState } from "./objects/state.js";
import RainGame from "./objects/game.js";

// Globals
let frameId;
let viewElement = document.querySelector("#viewContainer");
let category = "geography",
  difficulty = "easy";
let gameLoader, rainGame;
let screenHeight, screenWidth;
let canvas = document.querySelector("#cnv");
let ctx = canvas.getContext("2d");
let basketWidth = 175,
  basketHeight = 15;
let basketX, basketCenter;
let rightPressed = false,
  leftPressed = false;
let collision = false,
  correct = false;
let speeds = {
  easy: 1000,
  medium: 750,
  hard: 500,
  impossible: 250
};

function loadGame() {
  let gameUrl = `/data/${category}.json`;
  fetch(gameUrl)
    .then(response => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json();
    })  
    .then(data => {
      let g = data['easy'];
      rainGame = new RainGame(category, g.question, g.correctAnswers, g.incorrectAnswers, difficulty, canvas.width);

      let count = 3;
      rainGame.gameState = GameState.COUNTDOWN;
      startCountDown(count);
    })
    .catch(error => {
      console.error(error);
    });
}

function start() {
  loadGame();

  viewElement.classList.remove("start");
  viewElement.classList.add("ready");
}

function startCountDown(count) {
  clearCanvas();
  drawTitle(rainGame.question);
  if (count !== 0) {
    drawCountDown(count.toString());
  }

  if (count > 0) {
    count--;
    window.setTimeout(function() {
      startCountDown(count);
    }, 1000);
  } else {
    drawCountDown("GO!");
    setTimeout(() => {
      viewElement.classList.remove("ready");
      viewElement.classList.add("game");
      rainGame.startGame();
      draw();
      activateWordInterval();
    }, 1000);
  }
  // requestAnimationFrame(draw);
}

// Draw functions
function drawBasket() {
  ctx.beginPath();
  ctx.rect(basketX, canvas.height - 110, basketWidth, basketHeight);
  ctx.rect(
    basketX,
    canvas.height - 110 - basketHeight,
    basketHeight,
    basketHeight
  );
  ctx.rect(
    basketX + basketWidth - basketHeight,
    canvas.height - 110 - basketHeight,
    basketHeight,
    basketHeight
  );
  ctx.fillStyle = collision ? (correct ? "#22a011" : "#cc0606") : "#b7b7b7";
  ctx.fill();
  ctx.closePath();
}

function drawTitle(title) {
  ctx.font = "48px Arial";
  ctx.fillStyle = "#333333";
  ctx.textAlign = "center";
  ctx.fillText(title, canvas.width / 2, 110, canvas.width * 0.75);
}

function drawCountDown(count) {
  ctx.font = "48px Arial";
  ctx.fillStyles = "#333333";
  ctx.textAlign = "center";
  ctx.fillText(count, canvas.width / 2, (canvas.height / 2) - (canvas.height * 0.1), canvas.width * 0.75);
}

function drawWord(wordObj) {
  ctx.font = "28px Arial";
  ctx.fillStyle = "#f24660";
  ctx.fillText(wordObj.word, wordObj.x, wordObj.y, 165);
}

function draw() {
  clearCanvas();
  drawBasket();

  // draw words
  if (rainGame) {
    switch (rainGame.gameState) {
      case GameState.READY:
      case GameState.COUNTDOWN:
        return;
      case GameState.WIN:
        clearCanvas();
        alert("you win");
        cancelAnimationFrame(frameId);
        return;
      case GameState.LOSE:
        clearCanvas();
        alert("you lose");
        cancelAnimationFrame(frameId);
        return;
      default:
        drawTitle(rainGame.question);

        rainGame.activeWords.forEach(word => {
          if (word.collision || word.y > canvas.height + 50) {
            rainGame.setInactive(word);
            word.y = -100;
            return;
          }

          word.y += rainGame.gameDifficulty[difficulty];

          // detect collision
          if (
            word.y >= canvas.height - 110 - basketHeight * 2 &&
            word.y <= canvas.height - 110 &&
            word.x >= basketCenter - basketWidth / 2 &&
            word.x <= basketCenter + basketWidth / 2
          ) {
            correct = rainGame.isCorrect(word) ? true : false;
            collision = word.collision = true;

            // show color for 120ms, then default
            setTimeout(() => {
              collision = false;
              correct = false;
            }, 120);
          }

          drawWord(word);
        });
        break;
    }
  }

  // Move basket with arrow keys
  if (rightPressed && basketX < canvas.width - basketWidth) {
    basketX += 25;
  } else if (leftPressed && basketX > 0) {
    basketX -= 25;
  }
  basketCenter = basketX + basketWidth / 2;

  frameId = requestAnimationFrame(draw);
}

function activateWordInterval() {
  let count = 0;
  let timer = setInterval(() => {
    if (rainGame.gameState === GameState.END) {
      clearInterval(timer);
    }

    rainGame.setActive(rainGame.loadedWords[count]);
    count++;
    if (count >= rainGame.loadedWords.length) {
      count = 0;
    }
  }, speeds[difficulty.toLowerCase()]); // word interval speed
}

function resizeCanvas() {
  (screenHeight = window.innerHeight), (screenWidth = window.innerWidth);
  canvas.height = screenHeight - 50;
  canvas.width = ((screenHeight - 50) / 16) * 9;
  recenterBasket();
}

function recenterBasket() {
  basketX = (canvas.width - basketWidth) / 2;
  basketCenter = basketX + basketWidth / 2;
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function mouseMoveHandler(e) {
  let relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    basketX = relativeX - basketWidth / 2;
    basketCenter = basketX + basketWidth / 2;
  }
}

function init() {
  let btns = document.querySelectorAll(".btn");
  btns.forEach(el => {
    el.addEventListener("click", () => {
      if (el.classList.contains("btn-category")) {
        category = el.innerHTML.toLowerCase();
        let btnCats = document.querySelectorAll(".btn-category");
        btnCats.forEach(btncat => {
          btncat.classList.remove("selected");
        });
      } else if (el.classList.contains("btn-difficulty")) {
        difficulty = el.innerHTML.toLowerCase();
        let btnDiffs = document.querySelectorAll(".btn-difficulty");
        btnDiffs.forEach(btnDiff => {
          btnDiff.classList.remove("selected");
        });
      }
      el.classList.add("selected");
    });
  });
  document.querySelector(".btn-start").addEventListener("click", start);
  document.body.classList.add("loaded");
}

// Event Listeners
window.addEventListener("resize", resizeCanvas);

document.addEventListener("keydown", function keyDownHandler(e) {
  if (e.keyCode === 39) {
    rightPressed = true;
  } else if (e.keyCode === 37) {
    leftPressed = true;
  } else if (e.keyCode == 27) {
    // back to menu
    clearCanvas();
    cancelAnimationFrame(frameId);
    viewElement.classList.remove("game");
    viewElement.classList.add("start");
  }
});
document.addEventListener("keyup", function keyUpHandler(e) {
  if (e.keyCode === 39) {
    rightPressed = false;
  } else if (e.keyCode === 37) {
    leftPressed = false;
  }
});
document.addEventListener("mousemove", mouseMoveHandler, false);

document.addEventListener("DOMContentLoaded", function() {
  resizeCanvas();
  init();
});

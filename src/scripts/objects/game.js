import { GameState } from './state.js';
import RainWord from './rain.js';

export default class RainGame {

  constructor(ca, q, c, i, d, w) {
    this.category = ca;
    this.question = q;
    this.correctAnswers = c;
    this.incorrectAnswers = i;
    this.difficulty = d;

    this.loadedWords = [];
    this.activeWords = [];

    this.strikes = 0;
    this.answers = [];

    this.gameArea = w;
    this.gameState = GameState.READY;

    this.gameDifficulty = {
      'easy': 10,
      'medium': 16,
      'hard': 21,
      'impossible': 25
    };

    this.loadWords();
  }

  startGame() {
    this.gameState = GameState.RUNNING;
  }

  gameWin() {
    this.gameState = GameState.WIN;
  }

  gameLose() {
    this.gameState = GameState.LOSE;
  }

  loadWords() {
    let allWords = this.correctAnswers.concat(this.incorrectAnswers);
    allWords = this.shuffleArr(allWords);
    
    allWords.forEach(word => {
      let rand = this.getRandomPosition();
      let rw = new RainWord(rand, -100, word);
      this.loadedWords.push(rw);
    });
  }

  shuffleArr(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  isCorrect(wordObj) {
    let loadedIdx = this.loadedWords.indexOf(wordObj);
    let correctIdx = this.correctAnswers.indexOf(wordObj.word);
    let answer = { word: wordObj.word, correct: false }

    if (correctIdx > -1) {
      answer.correct = true;
      this.correctAnswers.splice(correctIdx, 1);
      // console.log(`Remaining: ${this.correctAnswers.length}`);
      if (this.correctAnswers.length === 0) {
        this.gameWin();
      }
    } else {
      this.strikes++;
      if (this.strikes >= 3) {
        this.gameLose();
      }
    }

    this.loadedWords.splice(loadedIdx, 1);
    this.answers.push(answer);

    console.log(`%c${answer.word}`, answer.correct ? `background: green; color: white` : 'background: red; color: white');

    return answer.correct;
  }

  setActive(wordObj) {
    if (wordObj) {
      wordObj.active = true;
      this.activeWords.push(wordObj);
    }
  }

  setInactive(wordObj) {
    if (wordObj) {
      wordObj.active = false;
      let inactiveWord = this.activeWords.splice(this.activeWords.indexOf(wordObj), 1)[0];
      inactiveWord.x = this.getRandomPosition();
    }
  }

  getRandomPosition(min = this.gameArea/6, max = this.gameArea - (this.gameArea/6)) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  }
}
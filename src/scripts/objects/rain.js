export default class RainWord {
  constructor(x, y, word, active = false) {
    this.x = x;
    this.y = y;
    this.word = word;
    this.active = active;
    this.collision = false;
  }
}
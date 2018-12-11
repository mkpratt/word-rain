export const GameState = Object.freeze({
  READY:   Symbol('ready'),
  COUNTDOWN: Symbol('countdown'),
  RUNNING: Symbol('running'),
  WIN: Symbol('win'),
  LOSE: Symbol('lose')
});
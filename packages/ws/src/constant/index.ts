export enum OPTCODE {
  CONTINUATION = 0x0,
  TEXT = 0x1,
  BINARY = 0x2,
  CLOSE = 0x8,
  PING = 0x9,
  PONG = 0xa,
}
// const OPCODES = {
//   CONTINUE: 0,
//   TEXT: 1,
//   BINARY: 2,
//   CLOSE: 8,
//   PING: 9,
//   PONG: 10,
// };

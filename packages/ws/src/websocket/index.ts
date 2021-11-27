import { createServer, Server, IncomingMessage } from 'http';
import { EventEmitter } from 'events';
import { Duplex } from 'stream';
import { createHash } from 'crypto';
import { OPTCODE } from '../constant';

export default class MyWebSocket extends EventEmitter {
  private server: Server;
  // @ts-ignore
  private buffer: Buffer;
  private MAGIC_RESONPOSE_HEADER = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
  private socket: Duplex | null = null;
  private closed: boolean = false;
  constructor(options: MyWebSocketOptions = {}) {
    super();
    this.server = createServer();
    const port = options.port || process.env.PORT || 1218;
    this.server.listen(port);
    this.server.on('upgrade', this.onUpgrade.bind(this));

    this.on('message', (data: string | Buffer) => {
      this.send(`接收到数据，${data}`);
    });
  }

  onUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer) {
    this.closed = false;

    this.socket = socket;
    const secKey = req.headers['sec-websocket-key'];
    const resHeaders = [
      'HTTP/1.1 101 Switching Protocols', // http 2 是否支持？
      'Upgrade: websocket',
      'Connection: Upgrade',
      'Sec-WebSocket-Accept: ' + this.enCryptHeader(secKey!),
      '',
      '', // 因为请求头结束之后需要用空行告诉客户端请求头结束
    ].join('\r\n');
    socket.write(resHeaders);

    socket.on('data', (buffer: Buffer) => {
      this.buffer = buffer;

      // TODO 使用 FIN 控制是否执行
      const { payloadIndex, PAYLOAD_LEN, FIN, MASK, OPTCODE } =
        this.processBufferMeta();

      const rawData = this.processRawData({
        MASK,
        payloadIndex,
        PAYLOAD_LEN,
      });

      FIN && this.processRealData({ optcode: OPTCODE, data: rawData });
    });

    socket.on('close', this.close.bind(this));
  }

  // 先 sha1 加密，再 base64 编码
  enCryptHeader(key: string) {
    return createHash('sha1')
      .update(key + this.MAGIC_RESONPOSE_HEADER, 'ascii')
      .digest('base64');
  }

  // 拿到的原始数据是二进制，需要转换下
  processBufferMeta(buffer?: Buffer) {
    const buf = buffer || this.buffer;
    // 真实数据的起始位置 / byte
    let payloadIndex = 2;
    // 从前 8 位中获取 FIN，RSV1，RSV2，RSV3，OPCODE，MASK，PAYLOAD LEN
    const firstByte = buf.readUInt8(0);
    const FIN = firstByte >> 7; // 取第一位
    const OPTCODE = firstByte & 0x0f; // 取后四位
    const secondByte = buf.readUInt8(1);
    const MASK = secondByte >> 7; // 取第二个字节的第一位

    let PAYLOAD_LEN = secondByte & 0x7f; // 取后七位
    // 126 表示数据长度大于 126，使用第三、四字节存储数据长度
    if (PAYLOAD_LEN === 126) {
      PAYLOAD_LEN = buf.readUInt16BE(2);
      payloadIndex = 4;
      // 127 标识数据长度大于 2^16，使用第三 - 十字节存储数据长度
    } else if (PAYLOAD_LEN === 127) {
      const validate = buf.readUInt32BE(2);
      // 协议规定第二、三四五字节必须全是0
      if (+validate !== 0) {
        this.send(this.closeFrame(1002, 'invalid data'));
        this.close();
      }
      // 因此实际存储长度的其实是第 6 - 10 字节
      PAYLOAD_LEN = buf.readUInt32BE(6);
      // 长度存储之后才是真实的数据
      payloadIndex = 10;
    }

    return {
      payloadIndex,
      PAYLOAD_LEN,
      FIN,
      MASK,
      OPTCODE,
    };
  }

  processRawData({
    MASK,
    payloadIndex,
    PAYLOAD_LEN,
  }: {
    MASK: number;
    payloadIndex: number;
    PAYLOAD_LEN: number;
  }) {
    // 如果没有 MASK，直接返回
    if (!MASK) {
      return this.buffer.slice(payloadIndex, payloadIndex + PAYLOAD_LEN);
    }
    // 如果有 MASK，需要对数据进行解码
    const mask = this.buffer.slice(payloadIndex, payloadIndex + 4);
    const data = this.buffer.slice(
      payloadIndex + 4,
      payloadIndex + PAYLOAD_LEN
    );
    return data.map((byte, index) => byte ^ mask[index % 4]);
  }

  processRealData({
    optcode,
    data,
  }: {
    optcode: OPTCODE;
    data: Buffer | Uint8Array;
  }) {
    if (optcode === OPTCODE.TEXT) {
      this.emit('message', data.toString());
    } else if (optcode === OPTCODE.BINARY) {
      this.emit('message', data);
    } else if (optcode === OPTCODE.CLOSE) {
      this.close();
    } else {
      this.send(this.closeFrame(1002, 'invalid optcode'));
      this.close();
    }
  }

  formatResponse(data: string | Buffer) {
    let optcode: OPTCODE;
    if (typeof data === 'string') {
      data = Buffer.from(data);
      optcode = OPTCODE.TEXT;
    } else if (Buffer.isBuffer(data)) {
      optcode = OPTCODE.BINARY;
    } else {
      throw new Error('data type error');
    }
    return this.encodeMessage(optcode, data);
  }

  encodeMessage(optcode: OPTCODE, payload: Buffer) {
    let fin = 0x80 | optcode;
    const length = payload.length;
    const buffer = Buffer.alloc(2 + length);
    // 和接收数据时一致，数据长度在 < 126, = 126, =127 不同逻辑，这里先只写 < 126 的
    if (length < 126) {
      buffer.writeUInt8(fin | 0 | 0 | 0 | optcode, 0);
      buffer.writeUInt8(length | 0, 1);
      payload.copy(buffer, 2);
    }
    return buffer;
  }

  send(data: string | Buffer) {
    this.socket!.write(this.formatResponse(data));
  }

  closeFrame(status: number, reason: any) {
    return `c${JSON.stringify([status, reason])}`;
  }

  close() {
    if (this.closed) {
      return;
    }
    this.socket!.end();
    this.closed = true;

    this.socket!.removeListener('close', this.close);
    this.socket = null;
  }
}

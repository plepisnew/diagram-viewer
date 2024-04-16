export class Logger {
  static _index = 0;

  static create(payloadTransformer) {
    return new Logger(payloadTransformer);
  }

  _payloadTransformer;
  _requestId;

  constructor(payloadTransformer) {
    this._payloadTransformer = payloadTransformer;
  }

  cleanContext() {
    const requestId = crypto.randomUUID();
    this._requestId = requestId;

    return requestId;
  }

  log(payload) {
    Logger._index++;
    const transformed = this._payloadTransformer(payload);

    Logger._index % 2 === 0
      ? console.log("\x1b[36m%s\x1b[0m", transformed)
      : console.log(transformed);
  }
}

// Simple UI+CLI for quickly generating lots of diagrams based on input data (tweaking options or prompt in different directions)

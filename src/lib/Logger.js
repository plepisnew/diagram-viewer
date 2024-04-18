export class Logger {
  static _index = 0;
  _requestId;
  _prefix;

  constructor(prefix) {
    this._requestId = crypto.randomUUID();
    this._prefix = prefix;
  }

  log(message, payload, maxLines) {
    Logger._index++;

    const messageLine = `${this._prefix} ${Date.now()} -- ${message}`;
    const payloadLines = typeof payload === "string" ? payload.split("\n") : [];
    const shortenedLines = payloadLines.slice(0, maxLines);

    const transformedPayloadLines = shortenedLines.map((line, lineIndex) => `[${lineIndex + 1}] ${line}`);

    if (payloadLines.length > shortenedLines.length) {
      transformedPayloadLines.push(`[${transformedPayloadLines.length + 1}] ...`);
    }

    const result = [messageLine, ...transformedPayloadLines].join("\n");

    Logger._index % 2 === 0 ? console.log("\x1b[36m%s\x1b[0m", result) : console.log(result);
    console.log();
  }
}

export class LoggerFactory {
  _scope;

  constructor(scope) {
    this._scope = scope;
  }

  create(subScope) {
    const prefix = `[${this._scope}:${subScope}]`;
    const logger = new Logger(prefix);

    return logger;
  }
}

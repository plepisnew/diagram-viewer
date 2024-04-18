import fs from "fs/promises";
import { existsSync } from "fs";
import { DiagramsApi } from "../clients/DiagramsApi";
import { ChatApi } from "../clients/ChatApi";
import { Logger, LoggerFactory } from "./Logger";

export class Program {
  _chatApiClient;
  _diagramsApiClient;
  _loggerFactory;

  constructor() {
    this._chatApiClient = new ChatApi({ apiKey: process.env.OPENAI_API_KEY });
    this._diagramsApiClient = new DiagramsApi();
    this._loggerFactory = new LoggerFactory("Program");
  }

  async modelDataUnsafe({ diagramType, data: pathOrData }) {
    const data = await this._resolveData(pathOrData);

    await this.modelData({ diagramType, data });
  }

  async modelData({ diagramType, data }) {
    const { guidelines } = await this._diagramsApiClient.getGuidelines({ diagramType });

    const { systemMessage, userMessage } = this._orderMessages({ guidelines, data });

    const model = await this._chatApiClient.send({ userMessage, systemMessage });
    const diagramUrl = await this._diagramsApiClient.render({ diagramType, model });

    return diagramUrl;
  }

  _orderMessages({ guidelines, data }) {
    const userMessage = data;

    const systemMessage = guidelines;

    return { userMessage, systemMessage };
  }

  async _resolveData(pathOrData) {
    const logger = this._loggerFactory.create("Data");

    const data = existsSync(pathOrData) ? await fs.readFile(pathOrData, { encoding: "utf-8" }) : pathOrData;
    logger.log(`Resolved input data:`, data);

    return data;
  }
}

import fs from "fs/promises";
import { existsSync } from "fs";
import { DiagramsApi } from "../clients/DiagramsApi";
import { ChatApi } from "../clients/ChatApi";
import { Logger } from "./Logger";

export class Program {
  _chatApiClient;
  _diagramsApiClient;
  _logger = Logger.create((m) => `[Program] ${m}`);

  constructor() {
    this._chatApiClient = new ChatApi({ apiKey: process.env.OPENAI_API_KEY });
    this._diagramsApiClient = new DiagramsApi();
  }

  // prettier-ignore
  async modelData({ diagramType, data: pathOrData }) {
    const data = await this._resolveData(pathOrData);

    const { guidelines } = await this._diagramsApiClient.getGuidelines({ diagramType });

    const { systemMessage, userMessage } = this._orderMessages({ guidelines, data });

    const diagram = await this._chatApiClient.send({ userMessage, systemMessage });
    const diagramUrl = await this._diagramsApiClient.render({ diagramType, model: diagram });
  }

  _orderMessages({ guidelines, data }) {
    const userMessage = data;

    const systemMessage = guidelines;

    return { userMessage, systemMessage };
  }

  async _resolveData(pathOrData) {
    const data = existsSync(pathOrData) ? await fs.readFile(pathOrData, { encoding: "utf-8" }) : pathOrData;

    return data;
  }
}

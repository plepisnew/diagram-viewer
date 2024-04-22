import fs from "fs/promises";
import { existsSync } from "fs";
import { DiagramsApi } from "../clients/DiagramsApi.js";
import { ChatApi } from "../clients/ChatApi.js";
import { LoggerFactory } from "./Logger.js";

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

  async modelData({ diagramType, data, systemMessageOverride }) {
    const { guidelines } = await this._diagramsApiClient.getGuidelines({ diagramType });

    const requestSpecification = systemMessageOverride
      ? { systemMessage: systemMessageOverride, userMessage: data }
      : this._orderMessages({ guidelines, data });

    const model = await this._chatApiClient.send(requestSpecification);
    const diagramUrl = await this._diagramsApiClient.render({ diagramType, model });

    return { model, diagramUrl };
  }

  _orderMessages({ guidelines, data }) {
    const userMessage = data;

    const contextPrompt = true
      ? ""
      : "You will be given a list of software requirements to model. The requirements will be separated by newlines. For each software requirement: assess whether it is both relevant and suitable for a context diagram (for example, it should not contain low level details). Before passing a requirement, consider whether or not it adds beneficial context to the model. Remember that this model will be shown to non-technical people. Your task is to construct a textual model according to the following guidelines:";
    const systemMessage = [contextPrompt, guidelines].join("\n");

    return { userMessage, systemMessage };
  }

  async _resolveData(pathOrData) {
    const logger = this._loggerFactory.create("Data");

    const data = existsSync(pathOrData) ? await fs.readFile(pathOrData, { encoding: "utf-8" }) : pathOrData;
    logger.log(`Resolved input data:`, data);

    return data;
  }
}

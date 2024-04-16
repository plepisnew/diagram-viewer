import { ChatGPTAPI } from "chatgpt";
import { z } from "zod";
import { Logger } from "../lib/Logger";

export class ChatApi {
  _internalApiClient;
  _internalApiClientOptions;
  _logger = Logger.create((m) => `[ChatApi] ${Date.now()} -- ${m}`);

  constructor({ apiKey, ...options }) {
    this._internalApiClient = new ChatGPTAPI({
      apiKey,
      completionParams: {},
    });
  }

  static Schemas = {
    send: {
      Request: z.object({
        userMessage: z.string(),
        systemMessage: z.string(),
      }),
    },
  };

  async send(request) {
    this._logger.log("Initializing Chat Completion API request context");
    const requestParse = ChatApi.Schemas.send.Request.safeParse(request);

    if (!requestParse.success) {
      this._logger.log(`Denying Chat Completion API request: ${requestParse.error}`);
      return null;
    }

    const { systemMessage, userMessage } = requestParse.data;
    this._logger.log(`Forwarding request to remote API in OpenAI`);

    const apiResponse = await this._internalApiClient.sendMessage(userMessage, {
      systemMessage,
      completionParams: this._internalApiClientOptions,
    });

    const {
      text,
      detail: { model, usage },
    } = apiResponse;

    this._logger.log(
      `Chat Completion API request successfully generated output:\n-------- FROM: --------\n${systemMessage.slice(
        0,
        200
      )}...\n-------- AND: --------\n${userMessage}\n-------- TO: --------\n${text}`
    );

    this._logger.log(
      `This query was run on a ${model} and cost a total of ${usage.total_tokens} tokens (${usage.prompt_tokens}/${usage.completion_tokens})`
    );

    return text;
  }
}

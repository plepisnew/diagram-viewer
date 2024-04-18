import { ChatGPTAPI } from "chatgpt";
import { z } from "zod";
import { LoggerFactory } from "../module/Logger";

export class ChatApi {
  _internalApiClient;
  _loggerFactory;

  constructor({ apiKey }) {
    this._internalApiClient = new ChatGPTAPI({ apiKey });
    this._loggerFactory = new LoggerFactory("ChatApi");
  }

  static ChatCompletionOptionsSchema = z
    .object({
      frequency_penalty: z.number().min(-2).max(2),
      presence_penalty: z.number().min(-2).max(2),
      max_tokens: z.number().min(0),
      model: z.enum(["gpt-3.5-turbo", "gpt-3.5-turbo-0301"]),
      temperature: z.number().min(0).max(2),
      top_p: z.number().min(0).max(1),
    })
    .partial();

  static Schemas = {
    send: {
      Request: z.object({
        userMessage: z.string(),
        systemMessage: z.string(),
        options: this.ChatCompletionOptionsSchema.optional(),
      }),
    },
  };

  async send(request) {
    const logger = this._loggerFactory.create("ChatCompletion");
    logger.log("Initializing API request context");

    const requestParse = ChatApi.Schemas.send.Request.safeParse(request);

    if (!requestParse.success) {
      logger.log("Denying Chat Completion API request:", requestParse.error);
      return null;
    }

    const { systemMessage, userMessage, options } = requestParse.data;
    logger.log("Forwarding request to remote API on OpenAI");

    const apiResponse = await this._internalApiClient.sendMessage(userMessage, {
      systemMessage,
      completionParams: options,
    });

    const {
      text,
      detail: { model, usage },
    } = apiResponse;

    logger.log("Chat Completion API request successfully generated output");
    logger.log("------- FROM (SYS): -------", systemMessage, 10);
    logger.log("------- AND (USR): -------", userMessage, 10);
    logger.log("------- TO: -------", text, 10);

    logger.log(
      `This query was run on a ${model} and cost a total of ${usage.total_tokens} tokens (${usage.prompt_tokens}/${usage.completion_tokens})`
    );

    return text;
  }
}

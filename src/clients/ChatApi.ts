import { ChatGPTAPI } from "chatgpt";
import { LoggerFactory } from "../modules/Logger.js";
import { SendChatRequest } from "../utils/Contract.js";

export class ChatApi {
	private readonly _internalApiClient: ChatGPTAPI;
	private readonly _loggerFactory: LoggerFactory;

	constructor(apiKey: string) {
		this._internalApiClient = new ChatGPTAPI({ apiKey });
		this._loggerFactory = new LoggerFactory("ChatApi");
	}

	async send({ userMessage, systemMessage, options }: SendChatRequest): Promise<string | null> {
		const logger = this._loggerFactory.create("ChatCompletion");
		logger.log("Forwarding request to remote API on OpenAI");

		try {
			const apiResponse = (await this._internalApiClient.sendMessage(userMessage, {
				systemMessage,
				completionParams: options,
			})) as {
				text: string;
				detail: {
					model: string;
					usage: { completion_tokens: number; total_tokens: number; prompt_tokens: number };
				};
			};

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
		} catch (err) {
			return null;
		}
	}
}

import { DiagramsApi } from "../clients/DiagramsApi.js";
import { ChatApi } from "../clients/ChatApi.js";
import { LoggerFactory } from "./Logger.js";
import { ModelDataRequest, ModelDataResponse } from "../utils/Contract.js";

export class Program {
	private readonly _chatApiClient: ChatApi;
	private readonly _diagramsApiClient: DiagramsApi;
	private readonly _loggerFactory: LoggerFactory;

	constructor() {
		this._chatApiClient = new ChatApi(process.env.OPENAI_API_KEY);
		this._diagramsApiClient = new DiagramsApi();
		this._loggerFactory = new LoggerFactory("Program");
	}

	async modelData({
		diagramType,
		data,
		systemMessageOverride,
	}: ModelDataRequest): Promise<ModelDataResponse | null> {
		const systemMessage = systemMessageOverride
			? systemMessageOverride
			: (await this._diagramsApiClient.getGuidelines({ diagramType, language: "mermaid" }))
					?.guidelines;

		if (systemMessage === undefined) {
			return null;
		}

		const model = await this._chatApiClient.send({ systemMessage, userMessage: data });
		if (model === null) {
			return null;
		}

		const diagramUrl = await this._diagramsApiClient.render({
			diagramType,
			model,
			language: "mermaid",
		});
		if (diagramUrl === null) {
			return null;
		}

		return { model, diagramUrl };
	}

	private static orderMessages({ guidelines, data }: { guidelines: string; data: string }) {
		const userMessage = data;

		const contextPrompt = true
			? ""
			: "You will be given a list of software requirements to model. The requirements will be separated by newlines. For each software requirement: assess whether it is both relevant and suitable for a context diagram (for example, it should not contain low level details). Before passing a requirement, consider whether or not it adds beneficial context to the model. Remember that this model will be shown to non-technical people. Your task is to construct a textual model according to the following guidelines:";
		const systemMessage = [contextPrompt, guidelines].join("\n");

		return { userMessage, systemMessage };
	}
}

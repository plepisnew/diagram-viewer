import axios, { AxiosInstance } from "axios";
import { LoggerFactory } from "../modules/Logger.js";
import fs from "fs/promises";
import path from "path";
import {
	GetGuidelinesRequest,
	GetGuidelinesResponse,
	getGuidelinesResponseSchema,
	RenderRequest,
} from "../utils/Contract.js";

export class DiagramsApi {
	// Diagrams API discovery
	private static readonly _baseUrl = "https://showme.redstarplugin.com";
	private static readonly _renderPath = "/render";
	private static readonly _guidelinesPath = "/diagram-guidelines";

	private readonly _internalApiClient: AxiosInstance;
	private readonly _loggerFactory: LoggerFactory;

	// Initialize HTTP client for delivering messages to Diagrams API
	constructor() {
		axios.defaults.headers.common["Accept-Encoding"] = "gzip";
		axios.defaults.headers.common["Accept"] = "application/json";
		axios.defaults.headers.common["Content-Type"] = "application/json";

		this._internalApiClient = axios.create({ baseURL: DiagramsApi._baseUrl });
		this._loggerFactory = new LoggerFactory("DiagramsApi");
	}

	async getGuidelines({
		diagramType,
		language,
	}: GetGuidelinesRequest): Promise<GetGuidelinesResponse | null> {
		const logger = this._loggerFactory.create("Guidelines");
		logger.log(
			`Requesting guidelines for composing "${diagramType}" diagrams written in "${language}"`
		);

		try {
			const apiResponse = await this._internalApiClient.get(DiagramsApi._guidelinesPath, {
				params: {
					explicitlyRequestedByUserDiagramLanguage: language,
					diagramType,
				},
			});

			const { diagramGuidelines, diagramLanguage } = apiResponse.data;
			const response = {
				guidelines: diagramGuidelines,
				language: diagramLanguage,
			};

			logger.log("Obtained guidelines: ", diagramGuidelines);

			const responseParse = getGuidelinesResponseSchema.safeParse(response);

			return responseParse.success ? responseParse.data : null;
		} catch (err) {
			return null;
		}
	}

	async render({ diagramType, language, model }: RenderRequest): Promise<string | null> {
		const logger = this._loggerFactory.create("Render");
		logger.log(`Initializing Diagrams API Render request context for diagram:`, model);

		const escapeDiagramRegex_1 = /```mermaid(?:\n+)?([\s\S]*?)(?:\n+)?```/;
		const escapeDiagramRegex_2 = /```(?:\n+)?([\s\S]*?)(?:\n+)?```/;

		const escapedDiagram = (
			model.match(escapeDiagramRegex_1)?.at(1) ||
			model.match(escapeDiagramRegex_2)?.at(1) ||
			model
		).replaceAll("<br />", " ");

		logger.log("Escaping diagram from raw response message:", escapedDiagram);

		try {
			const apiResponse = (await this._internalApiClient.get(DiagramsApi._renderPath, {
				params: {
					diagramLanguage: language,
					diagramType,
					diagram: escapedDiagram,
				},
			})) as { data: { results: { interpretingTheAPIResponse: string; errorMessage?: string }[] } };

			const result = apiResponse.data.results[0];
			const apiMessage = result.interpretingTheAPIResponse;

			const extractUrlRegex = /(?<=\[View fullscreen diagram\]\().*(?=\))/;
			const url = apiMessage.match(extractUrlRegex)?.at(0);

			if (!url) {
				const apiError = result.errorMessage;
				logger.log("Failed to render ${language}/${diagramType}:", apiError);

				return null;
			}

			logger.log(`Successfully rendered ${language}/${diagramType} to ${url}`);

			const date = new Date();
			const logPath = path.resolve(
				process.cwd(),
				"logs",
				`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}.txt`
			);
			await fs.appendFile(logPath, `|${model}|${url}|\n`);

			return url;
		} catch (err) {
			return null;
		}
	}
}

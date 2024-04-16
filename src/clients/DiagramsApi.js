import axios from "axios";
import { Logger } from "../lib/Logger";
import { z } from "zod";

export class DiagramsApi {
  // Diagrams API discovery
  static _baseUrl = "https://showme.redstarplugin.com";
  static _renderPath = "/render";
  static _guidelinesPath = "/diagram-guidelines";

  // Define contracts based on exposed OpenAPI schema at: https://showme.redstarplugin.com/openapi.json
  static LanguageSchema = z.enum(["mermaid"]);
  static DiagramSchema = z.enum(["graph", "sequence", "mindmap", "timeline", "entity-relationship"]);
  static Schemas = {
    getGuidelines: {
      Request: z.object({
        language: DiagramsApi.LanguageSchema.default(DiagramsApi.LanguageSchema.Enum.mermaid),
        diagramType: DiagramsApi.DiagramSchema.default(DiagramsApi.DiagramSchema.Enum.graph),
      }),
      Response: z.object({ guidelines: z.string(), language: z.string() }),
    },
    render: {
      Request: z.object({
        language: DiagramsApi.LanguageSchema.default(DiagramsApi.LanguageSchema.Enum.mermaid),
        diagramType: DiagramsApi.DiagramSchema.default(DiagramsApi.DiagramSchema.Enum.graph),
        model: z.string(),
      }),
    },
  };

  _internalApiClient;
  _logger = Logger.create((m) => `[DiagramsApi] ${Date.now()} -- ${m}`);

  // Initialize HTTP client for delivering messages to Diagrams API
  constructor() {
    axios.defaults.headers.common["Accept-Encoding"] = "gzip";
    axios.defaults.headers.common["Accept"] = "application/json";
    axios.defaults.headers.common["Content-Type"] = "application/json";

    this._internalApiClient = axios.create({ baseURL: DiagramsApi._baseUrl });
  }

  /**
   * This is a wrapper around the `/diagram-guidelines` endpoint, returning guidelines for constructing diagrams of the specified type. Guidelines are sent to the ChatGPT API through system messages.
   * @type {(options: { diagramType?: z.infer<DiagramsApi.DiagramSchema>; language?: z.infer<DiagramsApiLanguageSchema> }) =>
   * Promise<{ language: string; guidelines: string; } | null>}
   */
  async getGuidelines(request) {
    const requestParse = DiagramsApi.Schemas.getGuidelines.Request.safeParse(request);

    if (!requestParse.success) {
      return null;
    }

    const { diagramType, language } = requestParse.data;
    this._logger.log(`Requesting guidelines for composing "${diagramType}" diagrams written in "${language}"`);

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

    const responseParse = DiagramsApi.Schemas.getGuidelines.Response.safeParse(response);

    return responseParse.success ? responseParse.data : null;
  }

  /**
   * This is a wrapper around the `/render` endpoint, rendering textual models of the specified type into visual artifacts, which are shared with public image URLs.
   * @type {(options: { diagramType?: z.infer<DiagramsApi.DiagramSchema>; language?: z.infer<DiagramsApiLanguageSchema>; model: string; }) =>
   * Promise<{ message: string; url: string; } | null>}
   */
  async render(request) {
    const requestParse = DiagramsApi.Schemas.render.Request.safeParse(request);

    if (!requestParse.success) {
      this._logger.log(`Denying Diagram Render API request: ${requestParse.error}`);
      return null;
    }

    this._logger.log(`Initializing Diagram Render API request context for diagram:\n${request?.model}`);

    const { diagramType, language, model } = requestParse.data;
    const escapeDiagramRegex_1 = /```mermaid(?:\n+)?([\s\S]*?)(?:\n+)?```/;
    const escapeDiagramRegex_2 = /```(?:\n+)?([\s\S]*?)(?:\n+)?```/;

    const escapedDiagram =
      model.match(escapeDiagramRegex_1)?.at(1) || model.match(escapeDiagramRegex_2)?.at(2) || "<empty>";
    this._logger.log(`Escaping diagram from raw response message:\n${escapedDiagram}`);

    const apiResponse = await this._internalApiClient.get(DiagramsApi._renderPath, {
      params: {
        diagramLanguage: language,
        diagramType,
        diagram: escapedDiagram,
      },
    });

    const result = apiResponse.data.results[0];
    const apiMessage = result.interpretingTheAPIResponse;

    const extractUrlRegex = /(?<=\[View fullscreen diagram\]\().*(?=\))/;
    const url = apiMessage.match(extractUrlRegex)?.at(0);

    if (url) {
      this._logger.log(`Successfully rendered ${language}/${diagramType} to ${url}`);

      return url;
    }

    const apiError = result.errorMessage;
    this._logger.log(`Failed to render ${language}/${diagramType}:\n${apiError}`);

    return null;
  }
}

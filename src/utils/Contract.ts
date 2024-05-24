import { z } from "zod";

export const languageSchema = z.enum(["mermaid"]);

export const diagramTypeSchema = z.enum([
	"graph",
	"sequence",
	"mindmap",
	"timeline",
	"entity-relationship",
	"object",
	"state",
	"component",
	"block",
]);

// Define contracts based on exposed OpenAPI schema at: https://showme.redstarplugin.com/openapi.json

export const getGuidelinesRequestSchema = z.object({
	language: languageSchema.optional().default(languageSchema.Enum.mermaid),
	diagramType: diagramTypeSchema.optional().default(diagramTypeSchema.Enum.graph),
});

export const getGuidelinesResponseSchema = z.object({
	guidelines: z.string(),
	language: z.string(),
});

export const renderRequestSchema = z.object({
	language: languageSchema.optional().default(languageSchema.Enum.mermaid),
	diagramType: diagramTypeSchema.optional().default(diagramTypeSchema.Enum.graph),
	model: z.string(),
});

export const sendChatRequestSchema = z.object({
	userMessage: z.string(),
	systemMessage: z.string(),
	options: z
		.object({
			frequency_penalty: z.number().min(-2).max(2),
			presence_penalty: z.number().min(-2).max(2),
			max_tokens: z.number().min(0),
			model: z.enum(["gpt-3.5-turbo", "gpt-3.5-turbo-0301"]),
			temperature: z.number().min(0).max(2),
			top_p: z.number().min(0).max(1),
		})
		.partial()
		.optional(),
});

export const modelDataRequestSchema = z.object({
	diagramType: diagramTypeSchema.optional().default(diagramTypeSchema.Enum.graph),
	systemMessageOverride: z.string().optional(),
	data: z.string(),
});

export const modelDataResponseSchema = z.object({
	model: z.string(),
	diagramUrl: z.string(),
});

export const modelAsyncRequestSchema = z
	.object({
		requestId: z.string(),
	})
	.or(modelDataRequestSchema);

export type GetGuidelinesRequest = z.infer<typeof getGuidelinesRequestSchema>;

export type GetGuidelinesResponse = z.infer<typeof getGuidelinesResponseSchema>;

export type RenderRequest = z.infer<typeof renderRequestSchema>;

export type SendChatRequest = z.infer<typeof sendChatRequestSchema>;

export type ModelDataRequest = z.infer<typeof modelDataRequestSchema>;

export type ModelDataResponse = z.infer<typeof modelDataResponseSchema>;

export type ModelAsyncRequest = z.infer<typeof modelAsyncRequestSchema>;

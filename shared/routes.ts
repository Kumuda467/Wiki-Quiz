import { z } from "zod";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  conflict: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

const difficultySchema = z.enum(["easy", "medium", "hard"]);

export const quizQuestionSchema = z.object({
  question: z.string().min(1),
  options: z.tuple([
    z.string().min(1),
    z.string().min(1),
    z.string().min(1),
    z.string().min(1),
  ]),
  answer: z.string().min(1),
  difficulty: difficultySchema,
  explanation: z.string().min(1),
});

export const wikiQuizSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  title: z.string(),
  summary: z.string(),
  sections: z.array(z.string()),
  keyEntities: z.object({
    people: z.array(z.string()),
    organizations: z.array(z.string()),
    locations: z.array(z.string()),
  }),
  quiz: z.array(quizQuestionSchema),
  relatedTopics: z.array(z.string()),
  contentHash: z.string(),
  rawHtml: z.string().nullable().optional(),
  createdAt: z.number().int(),
});

export const wikiQuizListItemSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  title: z.string(),
  createdAt: z.number().int(),
});

export const extractResponseSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  summary: z.string(),
  sections: z.array(z.string()),
  keyEntities: z.object({
    people: z.array(z.string()),
    organizations: z.array(z.string()),
    locations: z.array(z.string()),
  }),
});

export const api = {
  wiki: {
    preview: {
      method: "GET" as const,
      path: "/api/wiki/preview",
      input: z
        .object({
          url: z.string().url(),
        })
        .optional(),
      responses: {
        200: extractResponseSchema,
        400: errorSchemas.validation,
      },
    },
    generate: {
      method: "POST" as const,
      path: "/api/wiki/generate",
      input: z.object({
        url: z.string().url(),
        forceRegenerate: z.boolean().optional(),
        storeRawHtml: z.boolean().optional(),
      }),
      responses: {
        201: wikiQuizSchema,
        400: errorSchemas.validation,
      },
    },
    history: {
      method: "GET" as const,
      path: "/api/wiki/history",
      input: z
        .object({
          q: z.string().optional(),
        })
        .optional(),
      responses: {
        200: z.array(wikiQuizListItemSchema),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/wiki/quizzes/:id",
      responses: {
        200: wikiQuizSchema,
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(
  path: string,
  params?: Record<string, string | number>,
): string {
  let url = path;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`:${key}`, String(value));
    }
  }
  return url;
}

export type WikiQuizResponse = z.infer<typeof api.wiki.generate.responses[201]>;
export type WikiQuizListResponse = z.infer<typeof api.wiki.history.responses[200]>;
export type ExtractResponse = z.infer<typeof api.wiki.preview.responses[200]>;
export type GenerateRequest = z.infer<typeof api.wiki.generate.input>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
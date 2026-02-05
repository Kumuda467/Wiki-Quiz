import { sql } from "drizzle-orm";
import {
  jsonb,
  pgTable,
  text,
  varchar,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const wikiQuizzes = pgTable("wiki_quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  sections: text("sections").array().notNull().default(sql`'{}'::text[]`),
  keyEntities: jsonb("key_entities")
    .$type<{
      people: string[];
      organizations: string[];
      locations: string[];
    }>()
    .notNull()
    .default({ people: [], organizations: [], locations: [] }),
  quiz: jsonb("quiz")
    .$type<
      {
        question: string;
        options: [string, string, string, string];
        answer: string;
        difficulty: "easy" | "medium" | "hard";
        explanation: string;
      }[]
    >()
    .notNull(),
  relatedTopics: text("related_topics").array().notNull().default(sql`'{}'::text[]`),
  contentHash: text("content_hash").notNull(),
  rawHtml: text("raw_html"),
  createdAt: integer("created_at").notNull().default(sql`extract(epoch from now())::int`),
});

export const insertWikiQuizSchema = createInsertSchema(wikiQuizzes).omit({
  id: true,
  createdAt: true,
});

export type WikiQuiz = typeof wikiQuizzes.$inferSelect;
export type InsertWikiQuiz = z.infer<typeof insertWikiQuizSchema>;

export type CreateWikiQuizRequest = {
  url: string;
  forceRegenerate?: boolean;
  storeRawHtml?: boolean;
};

export type WikiQuizResponse = WikiQuiz;
export type WikiQuizListResponse = Pick<
  WikiQuiz,
  "id" | "url" | "title" | "createdAt"
>[];

export type ExtractResponse = {
  url: string;
  title: string;
  summary: string;
  sections: string[];
  keyEntities: {
    people: string[];
    organizations: string[];
    locations: string[];
  };
};

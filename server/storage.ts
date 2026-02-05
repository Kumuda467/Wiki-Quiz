import { db } from "./db";
import { wikiQuizzes, type InsertWikiQuiz, type WikiQuiz } from "@shared/schema";
import { eq, ilike, or, desc } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getHistory(query?: { q?: string }): Promise<
    { id: string; url: string; title: string; createdAt: number }[]
  >;
  getQuiz(id: string): Promise<WikiQuiz | undefined>;
  getQuizByUrl(url: string): Promise<WikiQuiz | undefined>;
  createQuiz(quiz: InsertWikiQuiz): Promise<WikiQuiz>;
}

export class DatabaseStorage implements IStorage {
  async getHistory(query?: { q?: string }): Promise<
    { id: string; url: string; title: string; createdAt: number }[]
  > {
    const q = query?.q?.trim();

    if (!q) {
      return await db
        .select({
          id: wikiQuizzes.id,
          url: wikiQuizzes.url,
          title: wikiQuizzes.title,
          createdAt: wikiQuizzes.createdAt,
        })
        .from(wikiQuizzes)
        .orderBy(desc(wikiQuizzes.createdAt));
    }

    return await db
      .select({
        id: wikiQuizzes.id,
        url: wikiQuizzes.url,
        title: wikiQuizzes.title,
        createdAt: wikiQuizzes.createdAt,
      })
      .from(wikiQuizzes)
      .where(or(ilike(wikiQuizzes.title, `%${q}%`), ilike(wikiQuizzes.url, `%${q}%`)))
      .orderBy(desc(wikiQuizzes.createdAt));
  }

  async getQuiz(id: string): Promise<WikiQuiz | undefined> {
    const [row] = await db.select().from(wikiQuizzes).where(eq(wikiQuizzes.id, id));
    return row || undefined;
  }

  async getQuizByUrl(url: string): Promise<WikiQuiz | undefined> {
    const [row] = await db
      .select()
      .from(wikiQuizzes)
      .where(eq(wikiQuizzes.url, url));
    return row || undefined;
  }

  async createQuiz(quiz: InsertWikiQuiz): Promise<WikiQuiz> {
    const [row] = await db.insert(wikiQuizzes).values(quiz).returning();
    return row;
  }
}

export const storage = new DatabaseStorage();

import { db } from "./db";
import { wikiQuizzes, type InsertWikiQuiz, type WikiQuiz } from "@shared/schema";
import { eq, ilike, or, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

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

export class InMemoryStorage implements IStorage {
  private quizzes: Map<string, WikiQuiz> = new Map();
  private quizzesByUrl: Map<string, WikiQuiz> = new Map();

  async getHistory(query?: { q?: string }): Promise<
    { id: string; url: string; title: string; createdAt: number }[]
  > {
    const q = query?.q?.trim();
    let quizzes = Array.from(this.quizzes.values());

    if (q) {
      quizzes = quizzes.filter(
        quiz =>
          quiz.title.toLowerCase().includes(q.toLowerCase()) ||
          quiz.url.toLowerCase().includes(q.toLowerCase())
      );
    }

    return quizzes
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(quiz => ({
        id: quiz.id,
        url: quiz.url,
        title: quiz.title,
        createdAt: quiz.createdAt,
      }));
  }

  async getQuiz(id: string): Promise<WikiQuiz | undefined> {
    return this.quizzes.get(id);
  }

  async getQuizByUrl(url: string): Promise<WikiQuiz | undefined> {
    return this.quizzesByUrl.get(url);
  }

  async createQuiz(quiz: InsertWikiQuiz): Promise<WikiQuiz> {
    const id = nanoid();
    const now = Math.floor(Date.now() / 1000);
    const createdQuiz: WikiQuiz = {
      id,
      url: quiz.url,
      title: quiz.title,
      summary: quiz.summary,
      sections: quiz.sections,
      keyEntities: quiz.keyEntities,
      quiz: quiz.quiz,
      relatedTopics: quiz.relatedTopics,
      contentHash: quiz.contentHash,
      rawHtml: quiz.rawHtml || null,
      createdAt: now,
    };

    this.quizzes.set(id, createdQuiz);
    this.quizzesByUrl.set(quiz.url, createdQuiz);
    return createdQuiz;
  }
}

let storage: IStorage = new InMemoryStorage();

async function initializeStorage(): Promise<void> {
  try {
    // Try to test database connection
    await db.select().from(wikiQuizzes).limit(1);
    console.log("[storage] Using database storage");
    storage = new DatabaseStorage();
  } catch (error) {
    console.log("[storage] Database unavailable, using in-memory storage");
    storage = new InMemoryStorage();
  }
}

// Initialize storage asynchronously
initializeStorage();

// Fallback to in-memory if not initialized
export const getStorage = (): IStorage => storage;

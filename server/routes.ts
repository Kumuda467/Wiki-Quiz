import type { Express } from "express";
import type { Server } from "http";
import { getStorage } from "./storage";
import { api } from "@shared/routes";
import { insertWikiQuizSchema, type InsertWikiQuiz } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";

async function fetchWikipediaHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "user-agent": "AI Wiki Quiz Generator (educational project)",
      accept: "text/html",
    },
  });
  if (!res.ok) {
    throw Object.assign(new Error(`Failed to fetch page (${res.status})`), {
      status: 400,
    });
  }
  return await res.text();
}

function isWikipediaArticleUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      (u.hostname === "en.wikipedia.org" || u.hostname.endsWith(".wikipedia.org")) &&
      u.pathname.startsWith("/wiki/")
    );
  } catch {
    return false;
  }
}

function stripCitations(text: string): string {
  return text.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
}

function summarize(text: string, maxChars: number): string {
  const t = stripCitations(text);
  if (t.length <= maxChars) return t;
  return `${t.slice(0, Math.max(0, maxChars - 1)).trim()}…`;
}

function extractFromHtml(html: string, url: string): {
  url: string;
  title: string;
  summary: string;
  sections: string[];
  keyEntities: { people: string[]; organizations: string[]; locations: string[] };
  plainText: string;
} {
  // Avoid adding new deps on Node side; do a simple extraction.
  const titleMatch = html.match(/<h1[^>]*id="firstHeading"[^>]*>([\s\S]*?)<\/h1>/i);
  const rawTitle = titleMatch ? titleMatch[1] : "Wikipedia Article";
  const title = stripCitations(rawTitle.replace(/<[^>]+>/g, " "));

  // Try multiple patterns to find the content
  let body = html;
  const bodyMatch = html.match(/<div[^>]*id="mw-content-text"[^>]*>([\s\S]*?)(?:<div[^>]*id="mw-navigation"|<\/div>\s*<\/div>)/i);
  if (bodyMatch) {
    body = bodyMatch[1];
  } else {
    // Fallback: get the larger content area
    const altMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (altMatch) {
      body = altMatch[1];
    }
  }

  // Extract sections
  const sectionMatches = Array.from(body.matchAll(/<h2[^>]*>\s*(?:<span[^>]*>\s*)?<span[^>]*class="mw-headline"[^>]*id="[^"]*"[^>]*>([\s\S]*?)<\/span>/gi));
  const sections = sectionMatches
    .map((m) => stripCitations(m[1].replace(/<[^>]+>/g, " ")))
    .filter(Boolean)
    .slice(0, 20);

  // If no sections found, try alternative pattern
  if (sections.length === 0) {
    const altSections = Array.from(body.matchAll(/<h(?:2|3)[^>]*>([\s\S]*?)<\/h(?:2|3)>/gi));
    altSections.forEach(m => {
      const text = stripCitations(m[1].replace(/<[^>]+>/g, " ")).trim();
      if (text && text.length > 0 && sections.length < 20) {
        sections.push(text);
      }
    });
  }

  // Extract paragraphs
  const pMatches = Array.from(body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi));
  const paragraphs = pMatches
    .map((m) => stripCitations(m[1].replace(/<[^>]+>/g, " ")).trim())
    .filter((p) => p.length > 50);
  
  const plainText = paragraphs.join("\n\n");
  const summary = summarize(paragraphs.slice(0, 3).join(" "), 500);

  // Lightweight entity guess: collect linked page titles from first ~50 links.
  const linkMatches = Array.from(body.matchAll(/<a[^>]*href="\/wiki\/([^"]+)"[^>]*title="[^"]*"[^>]*>([\s\S]*?)<\/a>/gi));
  const candidates = linkMatches
    .map((m) => {
      const linkText = stripCitations(m[2].replace(/<[^>]+>/g, " ")).trim();
      return linkText || decodeURIComponent(m[1]).replace(/_/g, " ");
    })
    .filter((t) => !t.includes(":") && t.length > 1 && t.length < 100)
    .slice(0, 80);
  
  const uniq = Array.from(new Set(candidates));
  const people = uniq.filter((t) => /\b[A-Z][a-z]+\b/.test(t) && t.split(" ").length >= 2).slice(0, 10);
  const organizations = uniq.filter((t) => /(University|Institute|Company|Corporation|Agency|Committee|Organization|Park|Laboratory|Museum|Library|Foundation|Trust|School|College)\b/i.test(t)).slice(0, 10);
  const locations = uniq.filter((t) => /(Kingdom|United States|England|London|France|Germany|Italy|India|China|Japan|City|County|Province|State|Region|District|County|Borough)\b/i.test(t)).slice(0, 10);

  return {
    url,
    title,
    summary: summary || "A Wikipedia article",
    sections: sections.length > 0 ? sections : ["Overview", "History", "References"],
    keyEntities: { people, organizations, locations },
    plainText: plainText || title,
  };
}

function contentHash(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function generateHeuristicQuiz(input: {
  title: string;
  summary: string;
  sections: string[];
  keyEntities: { people: string[]; organizations: string[]; locations: string[] };
}): {
  quiz: {
    question: string;
    options: [string, string, string, string];
    answer: string;
    difficulty: "easy" | "medium" | "hard";
    explanation: string;
  }[];
  relatedTopics: string[];
} {
  const relatedTopics = Array.from(
    new Set([
      ...input.keyEntities.people,
      ...input.keyEntities.organizations,
      ...input.keyEntities.locations,
      ...input.sections,
    ].filter(Boolean)),
  ).slice(0, 12);

  const makeOptions = (correct: string, distractors: string[]): [string, string, string, string] => {
    const pool = distractors.filter((d) => d && d !== correct);
    const opts = [correct, ...pool.slice(0, 3)];
    while (opts.length < 4) opts.push(`${correct} (alternative)`);
    // shuffle
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts as [string, string, string, string];
  };

  const quiz = [] as {
    question: string;
    options: [string, string, string, string];
    answer: string;
    difficulty: "easy" | "medium" | "hard";
    explanation: string;
  }[];

  const section = input.sections[0] || "Introduction";
  quiz.push({
    question: `Which section is present in the article "${input.title}"?`,
    options: makeOptions(section, ["Overview", "Timeline", "References", "Appendix"]),
    answer: section,
    difficulty: "easy",
    explanation: `The section list extracted from the page includes "${section}".`,
  });

  const person = input.keyEntities.people[0] || input.title;
  quiz.push({
    question: `Which of the following is mentioned as a key person related to "${input.title}"?`,
    options: makeOptions(person, ["Ada Lovelace", "Isaac Newton", "Marie Curie", "Nikola Tesla"]),
    answer: person,
    difficulty: "easy",
    explanation: `Extracted from linked entities on the article page.`,
  });

  const org = input.keyEntities.organizations[0] || "Wikipedia";
  quiz.push({
    question: `Which organization is associated with the article content about "${input.title}"?`,
    options: makeOptions(org, ["NASA", "UNESCO", "World Bank", "CERN"]),
    answer: org,
    difficulty: "medium",
    explanation: `Derived from entities/links found on the page.`,
  });

  const loc = input.keyEntities.locations[0] || "United Kingdom";
  quiz.push({
    question: `Which location is connected to "${input.title}" according to the extracted entities?`,
    options: makeOptions(loc, ["Canada", "Australia", "Brazil", "South Africa"]),
    answer: loc,
    difficulty: "medium",
    explanation: `Derived from entities/links found on the page.`,
  });

  quiz.push({
    question: `What best describes the article "${input.title}"?`,
    options: makeOptions("A Wikipedia article summary", ["A news report", "A research paper", "A product manual"]),
    answer: "A Wikipedia article summary",
    difficulty: "hard",
    explanation: `This quiz is generated from the article's extracted summary text.`,
  });

  return { quiz: quiz.slice(0, 8), relatedTopics };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.wiki.preview.path, async (req, res) => {
    const url = String(req.query.url || "");
    if (!url || !isWikipediaArticleUrl(url)) {
      return res.status(400).json({ message: "Please provide a valid Wikipedia article URL.", field: "url" });
    }

    const html = await fetchWikipediaHtml(url);
    const extracted = extractFromHtml(html, url);
    res.json({
      url: extracted.url,
      title: extracted.title,
      summary: extracted.summary,
      sections: extracted.sections,
      keyEntities: extracted.keyEntities,
    });
  });

  app.post(api.wiki.generate.path, async (req, res) => {
    try {
      const input = api.wiki.generate.input.parse(req.body);
      if (!isWikipediaArticleUrl(input.url)) {
        return res.status(400).json({ message: "Please provide a valid Wikipedia article URL.", field: "url" });
      }

      const storage = getStorage();

      if (!input.forceRegenerate) {
        const existing = await storage.getQuizByUrl(input.url);
        if (existing) {
          return res.status(201).json(existing);
        }
      }

      const html = await fetchWikipediaHtml(input.url);
      const extracted = extractFromHtml(html, input.url);
      const hash = contentHash(extracted.plainText);

      const { quiz, relatedTopics } = generateHeuristicQuiz({
        title: extracted.title,
        summary: extracted.summary,
        sections: extracted.sections,
        keyEntities: extracted.keyEntities,
      });

      const toInsert: InsertWikiQuiz = insertWikiQuizSchema.parse({
        url: extracted.url,
        title: extracted.title,
        summary: extracted.summary,
        sections: extracted.sections,
        keyEntities: extracted.keyEntities,
        quiz,
        relatedTopics,
        contentHash: hash,
        rawHtml: input.storeRawHtml ? html : null,
      });

      const created = await storage.createQuiz(toInsert);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Invalid request",
          field: err.errors[0]?.path?.join("."),
        });
      }
      throw err;
    }
  });

  app.get(api.wiki.history.path, async (req, res) => {
    const storage = getStorage();
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const rows = await storage.getHistory({ q });
    res.json(rows);
  });

  app.get(api.wiki.get.path, async (req, res) => {
    const storage = getStorage();
    const id = String(req.params.id);
    const quiz = await storage.getQuiz(id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.json(quiz);
  });

  return httpServer;
}

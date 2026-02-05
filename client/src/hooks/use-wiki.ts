import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type {
  ExtractResponse,
  GenerateRequest,
  WikiQuizListResponse,
  WikiQuizResponse,
} from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useWikiPreview(url?: string) {
  return useQuery({
    queryKey: [api.wiki.preview.path, url ?? ""],
    enabled: !!url,
    queryFn: async (): Promise<ExtractResponse> => {
      const params = new URLSearchParams({ url: String(url) });
      const res = await fetch(`${api.wiki.preview.path}?${params.toString()}`, {
        credentials: "include",
      });

      if (res.status === 400) {
        const err = parseWithLogging(
          api.wiki.preview.responses[400],
          await res.json(),
          "wiki.preview 400",
        );
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`Failed to preview (${res.status})`);
      return parseWithLogging(
        api.wiki.preview.responses[200],
        await res.json(),
        "wiki.preview 200",
      );
    },
  });
}

export function useWikiHistory(q?: string) {
  return useQuery({
    queryKey: [api.wiki.history.path, q ?? ""],
    queryFn: async (): Promise<WikiQuizListResponse> => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);

      const url = params.toString()
        ? `${api.wiki.history.path}?${params.toString()}`
        : api.wiki.history.path;

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error(`Failed to load history (${res.status})`);
      return parseWithLogging(
        api.wiki.history.responses[200],
        await res.json(),
        "wiki.history 200",
      );
    },
  });
}

export function useWikiQuiz(id?: string) {
  return useQuery({
    queryKey: [api.wiki.get.path, id ?? ""],
    enabled: !!id,
    queryFn: async (): Promise<WikiQuizResponse> => {
      const url = buildUrl(api.wiki.get.path, { id: String(id) });
      const res = await fetch(url, { credentials: "include" });

      if (res.status === 404) {
        const err = parseWithLogging(
          api.wiki.get.responses[404],
          await res.json(),
          "wiki.get 404",
        );
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`Failed to fetch quiz (${res.status})`);
      return parseWithLogging(api.wiki.get.responses[200], await res.json(), "wiki.get 200");
    },
  });
}

export function useGenerateWikiQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: GenerateRequest): Promise<WikiQuizResponse> => {
      const validated = api.wiki.generate.input.parse(input);
      const res = await apiRequest(api.wiki.generate.method, api.wiki.generate.path, validated);

      if (res.status === 400) {
        const err = parseWithLogging(
          api.wiki.generate.responses[400],
          await res.json(),
          "wiki.generate 400",
        );
        throw new Error(err.message);
      }

      if (res.status !== 201) {
        throw new Error(`Unexpected status (${res.status}) generating quiz`);
      }

      return parseWithLogging(
        api.wiki.generate.responses[201],
        await res.json(),
        "wiki.generate 201",
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.wiki.history.path] });
    },
  });
}

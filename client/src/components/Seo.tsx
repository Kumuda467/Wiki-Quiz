import { useEffect } from "react";

export default function Seo({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  useEffect(() => {
    const prev = document.title;
    document.title = title;

    const ensureMeta = (name: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      return el;
    };

    if (description) {
      ensureMeta("description").setAttribute("content", description);
    }

    return () => {
      document.title = prev;
    };
  }, [title, description]);

  return null;
}

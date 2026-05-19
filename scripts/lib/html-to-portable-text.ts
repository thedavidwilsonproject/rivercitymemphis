/**
 * Minimal HTML → Portable Text converter for the migration.
 *
 * Handles: <p>, <h1-h4>, <blockquote>, <ul>/<ol>/<li>, <strong>/<b>,
 * <em>/<i>, <a href>, <br>, <img>. Anything else is treated as flat text.
 *
 * Images become Portable Text image blocks using an assetRef provided by
 * the caller (looked up from the imageRegistry).
 */
import * as cheerio from "cheerio";
import { randomBytes } from "node:crypto";

type Mark = "strong" | "em" | string; // strings are markDef keys (links)
type Span = {
  _type: "span";
  _key: string;
  text: string;
  marks: Mark[];
};
type Block =
  | {
      _type: "block";
      _key: string;
      style: "normal" | "h2" | "h3" | "h4" | "blockquote";
      listItem?: "bullet" | "number";
      level?: number;
      markDefs: { _key: string; _type: "link"; href: string; blank?: boolean }[];
      children: Span[];
    }
  | {
      _type: "image";
      _key: string;
      asset: { _type: "reference"; _ref: string };
      alt?: string;
    };

const key = () => randomBytes(4).toString("hex");

export function htmlToPortableText(
  html: string,
  imageAssetRef?: (src: string) => string | undefined,
): Block[] {
  if (!html?.trim()) return [];
  const $ = cheerio.load(`<root>${html}</root>`, null, false);
  const blocks: Block[] = [];
  walk($, $("root").children(), blocks, imageAssetRef);
  return blocks;
}

function walk(
  $: cheerio.CheerioAPI,
  els: cheerio.Cheerio<any>,
  out: Block[],
  imageAssetRef?: (src: string) => string | undefined,
) {
  els.each((_, el) => {
    const tag = (el as any).tagName?.toLowerCase();
    if (!tag) {
      const text = $(el).text().trim();
      if (text) out.push(textBlock("normal", [span(text, [])], []));
      return;
    }

    switch (tag) {
      case "p":
      case "div":
      case "section": {
        const { spans, markDefs } = inlineChildren($, $(el));
        if (spans.some((s) => s.text.trim())) {
          out.push(textBlock("normal", spans, markDefs));
        }
        return;
      }
      case "h1":
      case "h2": {
        const { spans, markDefs } = inlineChildren($, $(el));
        out.push(textBlock("h2", spans, markDefs));
        return;
      }
      case "h3": {
        const { spans, markDefs } = inlineChildren($, $(el));
        out.push(textBlock("h3", spans, markDefs));
        return;
      }
      case "h4":
      case "h5":
      case "h6": {
        const { spans, markDefs } = inlineChildren($, $(el));
        out.push(textBlock("h4", spans, markDefs));
        return;
      }
      case "blockquote": {
        const { spans, markDefs } = inlineChildren($, $(el));
        out.push(textBlock("blockquote", spans, markDefs));
        return;
      }
      case "ul":
      case "ol": {
        const listItem = tag === "ol" ? "number" : "bullet";
        $(el)
          .children("li")
          .each((__, li) => {
            const { spans, markDefs } = inlineChildren($, $(li));
            if (spans.some((s) => s.text.trim())) {
              out.push({
                _type: "block",
                _key: key(),
                style: "normal",
                listItem,
                level: 1,
                markDefs,
                children: spans,
              });
            }
          });
        return;
      }
      case "img": {
        if (!imageAssetRef) return;
        const src = $(el).attr("src");
        if (!src) return;
        const ref = imageAssetRef(src);
        if (!ref) return;
        out.push({
          _type: "image",
          _key: key(),
          asset: { _type: "reference", _ref: ref },
          alt: $(el).attr("alt"),
        });
        return;
      }
      case "br":
        return;
      default: {
        // Unknown block — recurse into its children.
        walk($, $(el).children(), out, imageAssetRef);
        // Also capture any direct text content.
        const text = $(el).clone().children().remove().end().text().trim();
        if (text) out.push(textBlock("normal", [span(text, [])], []));
      }
    }
  });
}

function inlineChildren(
  $: cheerio.CheerioAPI,
  el: cheerio.Cheerio<any>,
): {
  spans: Span[];
  markDefs: { _key: string; _type: "link"; href: string; blank?: boolean }[];
} {
  const spans: Span[] = [];
  const markDefs: {
    _key: string;
    _type: "link";
    href: string;
    blank?: boolean;
  }[] = [];

  const visit = (node: any, activeMarks: Mark[]) => {
    const $n = $(node);
    if (node.type === "text") {
      const text = ($n.text() ?? "").replace(/\s+/g, " ");
      if (text) spans.push(span(text, [...activeMarks]));
      return;
    }
    if (node.type !== "tag") return;
    const tag = node.tagName?.toLowerCase();
    switch (tag) {
      case "strong":
      case "b":
        $n.contents().each((_, c) => visit(c, [...activeMarks, "strong"]));
        return;
      case "em":
      case "i":
        $n.contents().each((_, c) => visit(c, [...activeMarks, "em"]));
        return;
      case "a": {
        const href = $n.attr("href");
        if (!href) {
          $n.contents().each((_, c) => visit(c, activeMarks));
          return;
        }
        const linkKey = key();
        markDefs.push({ _key: linkKey, _type: "link", href });
        $n.contents().each((_, c) => visit(c, [...activeMarks, linkKey]));
        return;
      }
      case "br":
        spans.push(span(" ", activeMarks));
        return;
      default:
        $n.contents().each((_, c) => visit(c, activeMarks));
    }
  };

  el.contents().each((_, c) => visit(c, []));
  return { spans, markDefs };
}

function span(text: string, marks: Mark[]): Span {
  return { _type: "span", _key: key(), text, marks };
}

function textBlock(
  style: "normal" | "h2" | "h3" | "h4" | "blockquote",
  children: Span[],
  markDefs: { _key: string; _type: "link"; href: string; blank?: boolean }[],
): Block {
  return {
    _type: "block",
    _key: key(),
    style,
    markDefs,
    children,
  };
}

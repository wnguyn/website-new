import { marked } from "marked";

export type Frontmatter = {
	title: string;
	date: string;
	description?: string;
};

export type ParsedMarkdown = {
	frontmatter: Frontmatter;
	html: string;
};

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function unquote(value: string): string {
	const trimmed = value.trim();
	if (
		(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
		(trimmed.startsWith("'") && trimmed.endsWith("'"))
	) {
		return trimmed.slice(1, -1);
	}
	return trimmed;
}

function parseFrontmatterBlock(block: string): Frontmatter {
	const out: Record<string, string> = {};
	for (const line of block.split(/\r?\n/)) {
		const match = line.match(/^([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.*)$/);
		if (!match) continue;
		out[match[1]] = unquote(match[2]);
	}
	const title = out.title;
	const date = out.date;
	if (!title) throw new Error("frontmatter missing required field: title");
	if (!date) throw new Error("frontmatter missing required field: date");
	return {
		title,
		date,
		description: out.description,
	};
}

export function parseMarkdown(raw: string): ParsedMarkdown {
	const match = raw.match(FRONTMATTER_RE);
	if (!match) {
		throw new Error("markdown file is missing frontmatter (--- ... ---)");
	}
	const frontmatter = parseFrontmatterBlock(match[1]);
	const body = match[2]
		.replace(/\r\n/g, "\n")
		.replace(/\n{3,}/g, "\n\n");
	const html = marked.parse(body, { async: false }) as string;
	return { frontmatter, html };
}

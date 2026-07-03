import { parseMarkdown, type Frontmatter } from "./markdown.ts";

export type Post = {
	slug: string;
	frontmatter: Frontmatter;
	html: string;
	dateValue: number;
};

const POSTS_DIR = "posts";

async function readPostFile(filename: string): Promise<Post> {
	const slug = filename.replace(/\.md$/, "");
	const path = `${POSTS_DIR}/${filename}`;
	const raw = await Bun.file(path).text();
	const { frontmatter, html } = parseMarkdown(raw);
	const dateValue = Date.parse(frontmatter.date);
	if (Number.isNaN(dateValue)) {
		throw new Error(`post ${slug} has invalid date: ${frontmatter.date}`);
	}
	return { slug, frontmatter, html, dateValue };
}

export async function getPosts(): Promise<Post[]> {
	const glob = new Bun.Glob("*.md");
	const files: string[] = [];
	for await (const file of glob.scan({ cwd: POSTS_DIR })) {
		files.push(file);
	}
	const posts = await Promise.all(files.map(readPostFile));
	posts.sort((a, b) => b.dateValue - a.dateValue);
	return posts;
}

export async function getPost(slug: string): Promise<Post | null> {
	if (!slug || slug.includes("/") || slug.includes("..")) return null;
	const filename = `${slug}.md`;
	const path = `${POSTS_DIR}/${filename}`;
	const file = Bun.file(path);
	if (!(await file.exists())) return null;
	return readPostFile(filename);
}

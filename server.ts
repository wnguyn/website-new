import { getPost, getPosts } from "./lib/posts.ts";
import { renderIndex, renderPostPage } from "./lib/layout.ts";

const PORT = Number(process.env.PORT ?? 3000);

const MIME: Record<string, string> = {
	".html": "text/html; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".js": "application/javascript; charset=utf-8",
	".mjs": "application/javascript; charset=utf-8",
	".ts": "application/javascript; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".svg": "image/svg+xml",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".webp": "image/webp",
	".ico": "image/x-icon",
	".woff": "font/woff",
	".woff2": "font/woff2",
	".txt": "text/plain; charset=utf-8",
	".xml": "application/xml; charset=utf-8",
	".md": "text/markdown; charset=utf-8",
};

const ROUTES: Record<string, string> = {
	"/": "index.html",
	"/credits": "credits.html",
};

async function serveFile(path: string): Promise<Response> {
	const file = Bun.file(path);
	if (!(await file.exists())) {
		return new Response("Not Found", { status: 404 });
	}
	const ext = path.slice(path.lastIndexOf(".")).toLowerCase();
	return new Response(file, {
		headers: {
			"Content-Type": MIME[ext] ?? "application/octet-stream",
		},
	});
}

async function handleBlogIndex(): Promise<Response> {
	const posts = await getPosts();
	return new Response(renderIndex(posts), {
		headers: { "Content-Type": MIME[".html"] },
	});
}

async function handleBlogPost(slug: string): Promise<Response> {
	const post = await getPost(slug);
	if (!post) {
		return new Response("Post not found", { status: 404 });
	}
	return new Response(renderPostPage(post), {
		headers: { "Content-Type": MIME[".html"] },
	});
}

Bun.serve({
	port: PORT,
	async fetch(req) {
		const url = new URL(req.url);
		let pathname = decodeURIComponent(url.pathname);

		if (pathname === "/blog" || pathname === "/blog/") {
			return handleBlogIndex();
		}

		const blogMatch = pathname.match(/^\/blog\/([^/]+)\/?$/);
		if (blogMatch) {
			return handleBlogPost(blogMatch[1]);
		}

		if (pathname in ROUTES) {
			pathname = `/${ROUTES[pathname]}`;
		}

		if (pathname === "/") pathname = "/index.html";

		const filePath = `.${pathname}`;

		try {
			const stat = await Bun.file(filePath).stat();
			if (stat.isDirectory()) {
				return serveFile(`${filePath}/index.html`);
			}
			return serveFile(filePath);
		} catch {
			return new Response("Not Found", { status: 404 });
		}
	},
});

console.log(`Server running at http://localhost:${PORT}`);

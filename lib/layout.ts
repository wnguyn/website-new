import type { Post } from "./posts.ts";

type NavKey = "home" | "blog" | "credits";

const NAV_LINKS: Record<NavKey, { href: string; label: string; icon: string }> = {
	home: {
		href: "/",
		label: "Home",
		icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
	},
	blog: {
		href: "/blog",
		label: "Posts",
		icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/></svg>`,
	},
	credits: {
		href: "/credits",
		label: "About",
		icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
	},
};

const NAME_DISPLAY: Record<NavKey, string> = {
	home: "welcome",
	blog: "website!",
	credits: "website!!",
};

function navHtml(active: NavKey): string {
	return Object.entries(NAV_LINKS)
		.map(([key, link]) => {
			const isActive = key === active;
			return `<a href="${link.href}"${isActive ? ' class="nav-active"' : ""}>
				<span class="nav-icon">${link.icon}</span>
				<div class="nav-label">${link.label}</div>
			</a>`;
		})
		.join("\n\t\t\t\t\t");
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function formatDate(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.valueOf())) return iso;
	return d.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "UTC",
	});
}

type ShellOpts = {
	title: string;
	description: string;
	path: string;
	navActive: NavKey;
	body: string;
};

function renderShell(opts: ShellOpts): string {
	const { title, description, path, navActive, body } = opts;
	const name = NAME_DISPLAY[navActive];
	return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=0.7" />
		<meta name="theme-color" content="#6878a0" />
		<meta name="description" content="${escapeHtml(description)}" />
		<meta property="og:site_name" content="will's website!" />
		<meta property="og:url" content="${escapeHtml(path)}" />
		<meta property="og:type" content="website" />
		<meta property="og:title" content="${escapeHtml(title)}" />
		<meta property="og:description" content="${escapeHtml(description)}" />

		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:title" content="${escapeHtml(title)}" />
		<meta name="twitter:description" content="${escapeHtml(description)}" />

		<title>wngyn.net</title>
		<link rel="stylesheet" href="/styles.css" />
		<script src="/_app/immutable/assets/scripts/lastfm-widget.js" defer></script>
	</head>
	<body>
		<div class="the-whole-ass-thing">
			<div class="main-surface">
				<header>
					<div class="name-display">
						<b>${escapeHtml(name)}</b>
					</div>
					<div class="header-lastfm" data-lastfm aria-label="Last played">
						<a class="header-lastfm-cover-link" data-lastfm-link target="_blank" rel="noopener noreferrer" title="View on Last.fm">
							<img class="header-lastfm-cover" data-lastfm-cover src="" alt="" hidden width="48" height="48" />
						</a>
						<div class="header-lastfm-text">
							<a class="header-lastfm-profile" data-lastfm-profile target="_blank" rel="noopener noreferrer">Last Played</a>
							<a class="header-lastfm-title" data-lastfm-link target="_blank" rel="noopener noreferrer"><span data-lastfm-title>loading…</span></a>
							<div class="header-lastfm-meta">
								<span data-lastfm-artist></span>
								<span data-lastfm-time></span>
							</div>
						</div>
					</div>
				</header>
					<nav>
						${navHtml(navActive)}
					</nav>
					<main class="main-panel">
${body}
					</main>
				</div>
			</div>
	</body>
</html>
`;
}

function postListItem(post: Post): string {
	const desc = post.frontmatter.description
		? `\n\t\t\t\t\t\t<p class="desc">${escapeHtml(post.frontmatter.description)}</p>`
		: "";
	return `<a href="/blog/${encodeURIComponent(post.slug)}" class="post">
\t\t\t\t\t\t\t<div class="post-row">
\t\t\t\t\t\t\t\t<h2 class="title">${escapeHtml(post.frontmatter.title)}</h2>
\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t<p class="date">${escapeHtml(formatDate(post.frontmatter.date))}</p>${desc}
\t\t\t\t\t\t</a>`;
}



export function renderIndex(posts: Post[]): string {
	const body = `\t\t\t\t\t<article>
\t\t\t\t\t\t<div role="separator" class="pixel-display title-separator">------------------------------------</div>
\t\t\t\t\t\t<h2>Posts</h2>
\t\t\t\t\t\t<p>Random stuff. Nothing crazy, but something I'd look back on one day.</p>
						<section>
							<div class="posts">
${posts.map((p) => postListItem(p)).join("\n\t\t\t\t\t\t\t\t\t\t\t")}
							</div>
						</section>
					</article>`;
	return renderShell({
		title: "Blog",
		description: "List of blog posts",
		path: "/blog",
		navActive: "blog",
		body,
	});
}

export function renderPostPage(post: Post): string {
	const body = `\t\t\t\t\t<article>
\t\t\t\t\t\t<div role="separator" class="pixel-display title-separator">------------------------------------</div>
						<p class="post-back"><a href="/blog">← posts</a></p>
						<h2>${escapeHtml(post.frontmatter.title)}</h2>
						<p class="post-date">${escapeHtml(formatDate(post.frontmatter.date))}</p>
\t\t\t\t\t\t<div class="post-body">
${post.html.trim()}
\t\t\t\t\t\t</div>
\t\t\t\t\t</article>`;
	return renderShell({
		title: post.frontmatter.title,
		description: post.frontmatter.description ?? post.frontmatter.title,
		path: `/blog/${post.slug}`,
		navActive: "blog",
		body,
	});
}

// you got me.....
const LASTFM_API_KEY = "eb455c2cb788382b7b5ea8c815f6674b";
const LASTFM_USERNAME = "MacintoshPlusSE";
const LASTFM_ROOT = "https://ws.audioscrobbler.com/2.0/";
const RYM_URL = "https://rateyourmusic.com/~wnguyen7";
const TRACK_LIMIT = 5;
const REFRESH_MS = 60 * 1000;
const ROOT_SELECTOR = "[data-lastfm]";

function buildLastfmUrl() {
	const params = new URLSearchParams({
		method: "user.getrecenttracks",
		user: LASTFM_USERNAME,
		api_key: LASTFM_API_KEY,
		format: "json",
		limit: String(TRACK_LIMIT),
	});
	return `${LASTFM_ROOT}?${params.toString()}`;
}

function pickCoverImage(images) {
	if (!Array.isArray(images)) return "";
	const preferred = images.find((img) => img.size === "extralarge");
	return preferred?.["#text"] || images[images.length - 1]?.["#text"] || "";
}

function escapeHtml(s) {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function trackHtml(track) {
	const title = track.name || "unknown";
	const artist = track.artist?.["#text"] || "unknown artist";
	const cover = pickCoverImage(track.image);
	const coverElement = cover
		? `<a class="lastfm-cover-link lastfm-rym" href="${RYM_URL}" target="_blank" rel="me noopener noreferrer" title="rate your music"><img class="lastfm-cover" src="${escapeHtml(cover)}" alt="" loading="lazy" /></a>`
		: '<span class="lastfm-cover"></span>';
	return `${coverElement}
		<span class="lastfm-info">
			<a class="lastfm-title lastfm-rym" href="${RYM_URL}" target="_blank" rel="me noopener noreferrer" title="rate your music">${escapeHtml(title)}</a>
			<span class="lastfm-meta">${escapeHtml(artist)}</span>
		</span>`;
}

async function loadLastfm() {
	const root = document.querySelector(ROOT_SELECTOR);
	if (!root) return;
	const trackEl = root.querySelector(".lastfm-track");
	if (!trackEl) return;

	try {
		const response = await fetch(buildLastfmUrl());
		if (!response.ok) throw new Error(`Last.fm error ${response.status}`);

		const data = await response.json();
		const tracks = data?.recenttracks?.track;
		if (!Array.isArray(tracks) || tracks.length === 0) {
			throw new Error("No recent tracks found.");
		}

		trackEl.innerHTML = trackHtml(tracks[0]);
		root.removeAttribute("data-lastfm-error");
	} catch (error) {
		trackEl.textContent = "unavailable";
		root.setAttribute("data-lastfm-error", "");
	}
}

document.addEventListener("DOMContentLoaded", () => {
	loadLastfm();
	setInterval(loadLastfm, REFRESH_MS);

	document.addEventListener("click", (event) => {
		const toggle = event.target.closest?.(".lastfm-toggle");
		if (toggle) {
			event.preventDefault();
			const root = toggle.closest(ROOT_SELECTOR);
			const trackEl = root?.querySelector(".lastfm-track");
			if (!root || !trackEl) return;
			const willOpen = trackEl.hidden;
			trackEl.hidden = !willOpen;
			toggle.setAttribute("aria-expanded", String(willOpen));
			return;
		}
		if (!event.target.closest?.(".lastfm-rym")) return;
		navigator.sendBeacon?.("/s.gif");
	});
});

// last.fm "last played / now playing" widget
// adapted from bitsixfour/website to fit the personal-website theme

const LASTFM_API_KEY = "10200f41b2cdb8a4ec376f891db1f18b";
const LASTFM_USERNAME = "MacintoshPlusSE";
const LASTFM_ROOT = "https://ws.audioscrobbler.com/2.0/";
const REFRESH_MS = 60 * 1000;
const ROOT_SELECTOR = "[data-lastfm]";

function buildLastfmUrl() {
	const params = new URLSearchParams({
		method: "user.getrecenttracks",
		user: LASTFM_USERNAME,
		api_key: LASTFM_API_KEY,
		format: "json",
		limit: "1",
	});
	return `${LASTFM_ROOT}?${params.toString()}`;
}

function formatRelativeTime(date) {
	const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
	if (seconds < 60) return "just now";
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	return `${days}d ago`;
}

function pickCoverImage(images) {
	if (!Array.isArray(images)) return "";
	const preferred = images.find((img) => img.size === "extralarge");
	return preferred?.["#text"] || images[images.length - 1]?.["#text"] || "";
}

function setText(root, key, value) {
	const el = root.querySelector(`[data-lastfm-${key}]`);
	if (el) el.textContent = value;
}

function setImage(root, src, alt) {
	const el = root.querySelector("[data-lastfm-cover]");
	if (!el) return;
	el.src = src || "";
	el.alt = alt || "Album cover";
	el.toggleAttribute("hidden", !src);
}

function setProfileUrl(root) {
	const link = root.querySelector("[data-lastfm-profile]");
	if (link) link.href = `https://www.last.fm/user/${LASTFM_USERNAME}`;
}

function setTrackUrl(root, url) {
	if (!url) return;
	const links = root.querySelectorAll("[data-lastfm-link]");
	links.forEach((link) => {
		link.href = url;
	});
}

async function loadLastfm() {
	const root = document.querySelector(ROOT_SELECTOR);
	if (!root) return;
	setProfileUrl(root);

	try {
		const response = await fetch(buildLastfmUrl());
		if (!response.ok) throw new Error(`Last.fm error ${response.status}`);

		const data = await response.json();
		const track = data?.recenttracks?.track?.[0];
		if (!track) throw new Error("No recent tracks found.");

		const title = track.name || "Unknown track";
		const artist = track.artist?.["#text"] || "Unknown artist";
		const cover = pickCoverImage(track.image);
		const isNowPlaying = track["@attr"]?.nowplaying === "true";

		setText(root, "title", title);
		setText(root, "artist", artist);
		setText(
			root,
			"time",
			isNowPlaying
				? ""
				: track.date?.uts
					? formatRelativeTime(new Date(Number(track.date.uts) * 1000))
					: "recently",
		);
		setImage(root, cover, `${title} cover art`);
		setTrackUrl(root, track.url);
		root.removeAttribute("data-lastfm-error");
	} catch (error) {
		setText(root, "title", "unavailable");
		setText(root, "artist", "");
		setText(root, "time", "");
		setImage(root, "", "");
		root.setAttribute("data-lastfm-error", "");
	}
}

document.addEventListener("DOMContentLoaded", () => {
	loadLastfm();
	setInterval(loadLastfm, REFRESH_MS);
});

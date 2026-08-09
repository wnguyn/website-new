const BAN_FILE = "banned-ips.txt";
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;
const AUTO_BAN_MS = 6 * 60 * 60 * 1000;
const BOT_BAN_MS = 24 * 60 * 60 * 1000;

const BOT_PATTERNS = [
	/GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-Web|anthropic-ai|PerplexityBot|Perplexity-User|Bytespider|CCBot|cohere-ai|AI2Bot|Amazonbot|ImagesiftBot|Meta-ExternalAgent|Applebot-Extended/i,
	/AhrefsBot|SemrushBot|MJ12bot|DotBot|PetalBot|DataForSeoBot|SerpstatBot|SeznamBot|YisouSpider|Sogou|BLEXBot|Fyrebot|MegaIndex/i,
	/ZmEu|masscan|zgrab|nuclei|sqlmap|nikto|wpscan|nessus|libwww-perl|python-requests|python-urllib|scrapy|Go-http-client|okhttp|HeadlessChrome|PhantomJS/i,
];

const bans = new Map<string, number>();
const counts = new Map<string, { count: number; windowStart: number }>();

function isBot(ua: string): boolean {
	return BOT_PATTERNS.some((re) => re.test(ua));
}

async function persistBans(): Promise<void> {
	const now = Date.now();
	const lines: string[] = [];
	for (const [ip, expiry] of bans) {
		if (expiry !== 0 && expiry <= now) continue;
		lines.push(`${ip} ${expiry}`);
	}
	await Bun.write(BAN_FILE, lines.join("\n") + (lines.length > 0 ? "\n" : ""));
}

export async function loadBans(): Promise<number> {
	const file = Bun.file(BAN_FILE);
	if (!(await file.exists())) return 0;
	const now = Date.now();
	for (const line of (await file.text()).split("\n")) {
		const [ip, expiryStr] = line.trim().split(/\s+/);
		if (!ip) continue;
		const expiry = Number(expiryStr ?? 0);
		if (expiry !== 0 && expiry <= now) continue;
		bans.set(ip, expiry);
	}
	return bans.size;
}

export async function isBlocked(ip: string, ua: string): Promise<boolean> {
	const now = Date.now();
	const banExpiry = bans.get(ip);
	if (banExpiry !== undefined) {
		if (banExpiry === 0 || banExpiry > now) return true;
		bans.delete(ip);
	}

	if (isBot(ua)) {
		bans.set(ip, now + BOT_BAN_MS);
		await persistBans();
		console.log(`[security] banned bot ${ip} (UA: ${ua.slice(0, 80)})`);
		return true;
	}

	const entry = counts.get(ip);
	if (!entry || entry.windowStart + WINDOW_MS <= now) {
		counts.set(ip, { count: 1, windowStart: now });
		return false;
	}
	entry.count++;
	if (entry.count > MAX_REQUESTS) {
		bans.set(ip, now + AUTO_BAN_MS);
		await persistBans();
		console.log(
			`[security] rate limit: banned ${ip} (${entry.count} req/${WINDOW_MS / 1000}s)`,
		);
		return true;
	}
	return false;
}

export function bannedCount(): number {
	const now = Date.now();
	let n = 0;
	for (const expiry of bans.values()) {
		if (expiry === 0 || expiry > now) n++;
	}
	return n;
}

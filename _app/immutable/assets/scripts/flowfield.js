// drifting vector flow-field background
// particles trace streamlines of a smooth trig-based field;
// trails fade into the page background. muted palette only.

(() => {
	const reduceMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;

	// pulled from :root so the field stays in-palette
	const css = getComputedStyle(document.documentElement);
	const PALETTE = [
		css.getPropertyValue("--blue").trim() || "#a4988e",
		css.getPropertyValue("--green").trim() || "#7a8a64",
		css.getPropertyValue("--red").trim() || "#9a5a52",
		css.getPropertyValue("--orange").trim() || "#9e8060",
	];
	const FADE = css.getPropertyValue("--main-bg").trim() || "#181614";

	const canvas = document.createElement("canvas");
	canvas.className = "flowfield";
	canvas.setAttribute("aria-hidden", "true");
	// sit behind the grid + panel
	canvas.style.cssText =
		"position:fixed;inset:0;width:100%;height:100%;z-index:-2;pointer-events:none;display:block;";
	document.body.appendChild(canvas);

	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	let w = 0;
	let h = 0;
	let dpr = 1;
	let particles = [];
	let raf = 0;
	let running = false;

	function resize() {
		dpr = Math.min(window.devicePixelRatio || 1, 2);
		w = window.innerWidth;
		h = window.innerHeight;
		canvas.width = Math.floor(w * dpr);
		canvas.height = Math.floor(h * dpr);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		// reset fade coat so resize doesn't smear
		ctx.fillStyle = FADE;
		ctx.fillRect(0, 0, w, h);
		seed();
	}

	// cheap smooth pseudo-noise: layered sines → organic field
	function fieldAngle(x, y, t) {
		const s = 0.0016;
		const n =
			Math.sin(x * s + t * 0.00018) * 1.0 +
			Math.cos(y * s * 1.3 - t * 0.00022) * 0.8 +
			Math.sin((x + y) * s * 0.6 + t * 0.0001) * 0.6;
		return n * Math.PI * 1.2;
	}

	function makeParticle() {
		return {
			x: Math.random() * w,
			y: Math.random() * h,
			life: 0,
			max: 80 + Math.random() * 220,
			color: PALETTE[(Math.random() * PALETTE.length) | 0],
		};
	}

	function seed() {
		const density = Math.round((w * h) / 9000);
		const count = Math.max(140, Math.min(520, density));
		particles = Array.from({ length: count }, makeParticle);
	}

	function step(t) {
		// fade previous frame slightly → streamline trails
		ctx.fillStyle = FADE + "0c"; // ~5% alpha fade coat
		ctx.fillRect(0, 0, w, h);

		for (const p of particles) {
			const a = fieldAngle(p.x, p.y, t);
			const nx = p.x + Math.cos(a) * 1.1;
			const ny = p.y + Math.sin(a) * 1.1;

			ctx.strokeStyle = p.color;
			ctx.globalAlpha = 0.18;
			ctx.lineWidth = 0.9;
			ctx.beginPath();
			ctx.moveTo(p.x, p.y);
			ctx.lineTo(nx, ny);
			ctx.stroke();

			p.x = nx;
			p.y = ny;
			p.life++;

			if (
				p.life > p.max ||
				p.x < -8 ||
				p.x > w + 8 ||
				p.y < -8 ||
				p.y > h + 8
			) {
				Object.assign(p, makeParticle());
			}
		}
		ctx.globalAlpha = 1;
	}

	function loop(t) {
		if (!running) return;
		step(t);
		raf = requestAnimationFrame(loop);
	}

	function start() {
		if (running || reduceMotion) return;
		running = true;
		raf = requestAnimationFrame(loop);
	}

	function stop() {
		running = false;
		cancelAnimationFrame(raf);
	}

	// reduced-motion: draw one static, faded frame so the field is still present
	function staticFrame() {
		for (let i = 0; i < 60; i++) step(performance.now());
		ctx.fillStyle = FADE + "22";
		ctx.fillRect(0, 0, w, h);
	}

	let resizeTimer = 0;
	window.addEventListener("resize", () => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(() => {
			resize();
			if (reduceMotion) staticFrame();
		}, 150);
	});

	document.addEventListener("visibilitychange", () => {
		if (document.hidden) stop();
		else start();
	});

	resize();
	if (reduceMotion) {
		staticFrame();
	} else {
		start();
	}
})();

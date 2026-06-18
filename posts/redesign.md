---
title: Analyzing my entire music listening history in Obsidian & Rust
date: 2026-03-16
description: ""
---

I wanted a intuitive way to visualize all my last.fm data, so I created a program to use Obsidian to parse all this data. Granted, I wanted to use Obsidian for the Graph View functionality - as with the amount of scrobbles I have it's just not intuitive to just view the data traditionally. Ironically, I don't actually use Obsidian, but I just thought it would be the best for the job due to the "connections" that is always shilled by Obsidian users.

I've been quietly "scrobbling" my last.fm data ever since I was around 10-11, so I pretty much have data of all the music I have pretty much ever "actively listened" to. Although I don't actually use last.fm and check my top artists are for X days or whatever, because I think that tracking your stats like that isn't the way you should approach actually enjoying music.

Regardless, I started to implement a program in Rust because I intended this to be shoved on my server to continuously update, so I wanted to be forced to implement edge-case solutions.

Since I decided to use Obsidian, you can simply... just write files with connections. 
```rs
if let Some(cover_art_url) = metadata.cover_art_url.as_deref() {
    writeln!(&mut body, "![{} cover]({})", stats.album, cover_art_url).unwrap();
    writeln!(&mut body).unwrap();
}
writeln!(&mut body, "- artist: [[{}]]", stats.artist).unwrap();
writeln!(&mut body, "- album: {}", stats.album).unwrap();
writeln!(&mut body, "- scrobble_count: {}", stats.scrobble_count).unwrap();
writeln!(&mut body, "- last song: {}", stats.last_song).unwrap();
writeln!(&mut body, "- played at: {}", stats.last_played_at).unwrap();
writeln!(&mut body, "- genres: {}", .....
```
The key gimmick at hand is making connections using [[]] for genres which I fetched using MusicBrainz.

While MusicBrainz isn't as hardcore for genres unlike various other websites on the information superhighway (RYM) I would say it's good enough: it obviously doesn't place an Indietronica album as a Pop album. Writing this basic program I had mapped all my music palette from thorough-out the years. I would say most of it is pretty embarrassing, but I mean I would say if I'm older I'd look back at my current taste as embarrassing no?

You can see this POC in my website https://obsidian.wngyn.net which uses quartz as a basic frontend. This has only started to chart data from the Subsonic API around the time of writing this. 3

Obviously, while this is very gimmicky, I still think there is some use of this in charting long term data. It's pretty interesting seeing a generic genre called "rock" diverge into all the random subcategories that connect to it.

[UPDT: June 9th 2026]
Now that we're halfway through the year I decided to make the Quartz GUI more interactive and added a color scheme. Here lies the final photo of all the accumulated listens:

![alt text](https://files.catbox.moe/m724ms)
I also realized that I left this program to work such that it displays the exact UTC date instead of UTC-6, but whatever.

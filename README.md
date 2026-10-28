<img src="assets/favicon.svg" width="64" height="64" alt="">

# MODULØR

Website for MODULØR — dark industrial drum & bass. Lives at [modulør.com](https://xn--modulr-fya.com) (punycode: `xn--modulr-fya.com`).

Plain static site, no build step: `index.html`, `css/style.css`, `js/main.js`. Open `index.html` in a browser or upload the folder to any static host.

## Content

| What | Where |
| --- | --- |
| Band video | `assets/video/` (see below). Plays muted when in view, sound toggle in the frame. Without a file the frame shows "no signal". |
| Band photos | `assets/band/patrick.jpg`, `leo.jpg`, `tim.jpg` (portrait or square, shown grayscale). Missing photos fall back to a silhouette. |
| Names / roles | `#operators` in `index.html` |
| Gigs | `#dates` in `index.html`, one `<li data-date="YYYY-MM-DD">` per gig. Past dates hide automatically; with none left an "announced on Instagram" line appears. |
| Booking mail / Instagram | `#booking` in `index.html` (and the nav + JSON-LD `sameAs`). |

## Video

The master (`260923_MODULØR.mp4`, 1080p, 131 MB) is not in the repo. The site uses web encodes the browser picks from, streamed progressively (`faststart`, `preload="metadata"`), so visitors only download what they watch:

| File | Codec | Size | Used by |
| --- | --- | --- | --- |
| `modulor.webm` | AV1 1080p + Opus | 13 MB | modern desktop browsers |
| `modulor.mp4` | H.264 1080p + AAC | 27 MB | fallback (older Safari etc.) |
| `modulor-720.mp4` | H.264 720p + AAC | 13 MB | screens ≤ 700px |
| `poster.jpg` | frame at 0:36 | 73 KB | shown before playback |

Re-create from a new master:

```sh
SRC=master.mp4
ffmpeg -i "$SRC" -c:v libsvtav1 -preset 6 -crf 36 -g 240 -pix_fmt yuv420p -c:a libopus -b:a 96k assets/video/modulor.webm
ffmpeg -i "$SRC" -c:v libx264 -preset slower -tune film -crf 28 -maxrate 3000k -bufsize 6000k -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart assets/video/modulor.mp4
ffmpeg -i "$SRC" -vf scale=1280:-2 -c:v libx264 -preset slower -tune film -crf 28 -maxrate 1500k -bufsize 3000k -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart assets/video/modulor-720.mp4
ffmpeg -ss 36 -i "$SRC" -frames:v 1 -q:v 3 assets/video/poster.jpg
```

Concept mockups from the design phase are in `concepts/`.

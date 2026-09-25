# Midas Content Hub

Live page: https://claude.ai/artifact/Rg1DnvLvTdeeJAyUuNEd1a

- `index.html` is the page. Posts live in the page's database (`posts` collection) and the posted log lives in `log`.
- `build-seed.mjs` builds `seed/*.json`, which Claude loads into `posts`. New campaigns are added as new rows, so the page does not need to be republished.
- `img/` holds the images published with the page.

Rules for new content: each platform gets its own wording, no two posts open with the same line, and no image is used twice on the same platform. Before writing a new campaign, check `log` and the existing `posts` rows.

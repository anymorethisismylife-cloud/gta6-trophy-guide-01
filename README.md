# Leonida Ledger — GTA VI Trophy Guide & Tracker

An offline guide and tracker for all **55 Grand Theft Auto VI trophies** on
PlayStation 5, built for the make.fun `gta6-trophy-guide-01` competition
($250, free entry, entries close 2026-11-21T11:00:00Z).

## What it is

- **The official list, whole:** 55 trophies — 1 platinum, 2 gold, 6 silver,
  46 bronze; 28 hidden on PlayStation; 0 online. Every trophy shows its
  official name, description and grade exactly as PlayStation publishes them
  (Exophase and PSNProfiles agree on all 55).
- **A guide to each trophy, in our own words, that cites its sources:**
  what to do, where and how, and when it can be missed. Each guide names its
  sources beside it (Exophase, PSNProfiles, PowerPyx, Push Square, KeenGamer,
  GTABase, GTASpotter) — a cited guide beats an uncited one, however detailed.
  The game came out on 19 November 2026 and this guide was built from the
  official list and the published guides, not from a finished playthrough;
  where a place or step is not pinned down by a cited source, the guide says
  so instead of guessing.
- **A tracker:** a checklist saved in the browser (localStorage), with
  export to a file and import back, per-trophy progress counters for every
  PSN count target (250 stunts, 42 shooting-range golds, 100 WAiNK locations
  …), filters by kind (story, missable, collectibles, activities, online),
  by grade, by earned/remaining, and free-text search.
- **A spoiler setting:** hides the names and descriptions of the 17 story
  trophies until they are earned.
- **A roadmap to the platinum:** three stages in order — story (60–80 h),
  the 100% Completion checklist (about 100 h), Strangers & Freaks and cleanup
  (about 10 h). PowerPyx rates the platinum 4/10 and about 200 hours.
- **The missables, flagged:** exactly one potentially missable trophy,
  Positive Mental Attitude — the first meditation in Chapter 1. Everything
  else can be earned after the story in free-roam.

No Rockstar Games logo, artwork or game screenshots are used. The look is
the guide's own (dark Vice-night theme). The app is static files under
`app/` and works with the network off: it fetches nothing at run time, and a
source link opens only if the reader follows it.

## Run it

```sh
node serve.ts        # serves app/ on http://localhost:8080
```

Node 22 or later, standard library only, no build step, no dependencies.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and
writes `dossier.json` with `buildDossier` from the vendored
`vendor/makefun-frontend.ts` (the kit's copy, unchanged).

## Screenshots

`shots.json` says which view each screenshot shows:

1. `1-checklist.jpg` — checklist, progress and filters (13 of 55 earned)
2. `2-guide.jpg` — a trophy's guide and its sources open beside the list
3. `3-roadmap.jpg` — roadmap to the platinum, with the missable flagged
4. `4-spoiler.jpg` — spoiler setting on, with export/import

## License

MIT — see `LICENSE`.

// The roadmap to the platinum, built from the official descriptions and the cited
// guides (PowerPyx, Push Square, KeenGamer, GTABase). Three stages, in order.
export const ROADMAP_STAGES = [
  {
    id: 'story',
    title: 'Stage 1 — Play the story',
    hours: '60–80 hours',
    text: 'Play all five chapters and take optional missions and stranger encounters as they appear — many are only offered for a while. Scan vehicles and study animals with the binoculars as you travel: that progress counts toward 100% later. Before you leave Chapter 1, do the balcony meditation with Lucia at Jason\u2019s house (after the Down to Earth mission): it is the one thing in the game that may be missable. Save manually at the start and end of every chapter — missions cannot be replayed.',
    trophyIds: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 22, 23, 24, 26, 27],
  },
  {
    id: 'checklist',
    title: 'Stage 2 — The 100% Completion checklist',
    hours: 'About 100 hours',
    text: 'After the credits, open Touch Pad, then Progress, then Stats, then 100% Completion and work through the list: every robbery (39 gang operations, 22 bank jobs, 7 payday loan jobs), the underwater discoveries, all shooting ranges and drone races, Bret\u2019s target decks, 15 of the 18 card sets and 70 of the 80 challenges. The checklist is closer to 60% true completion — 200 of 277 vehicles scanned, 100 of 255 animals studied — but it is still the longest stage by far. Nothing on the checklist itself is missable.',
    trophyIds: [14, 15, 17, 18, 30, 31, 32, 35, 40, 41, 43, 52],
  },
  {
    id: 'cleanup',
    title: 'Stage 3 — Strangers & Freaks and cleanup',
    hours: 'About 10 hours',
    text: 'Finish the 8 Strangers & Freaks strands and any character questlines still open (Andy, Kenton, Billy, Randy, Tyrone, Bret), then sweep whatever counters are left: meditation spots, WAiNK locations, races, vehicles, garages and the partner trophies. Once the story is over every quest giver tied to a trophy comes back, so nothing here can strand you.',
    trophyIds: [16, 19, 20, 21, 25, 28, 29, 33, 34, 36, 37, 38, 39, 42, 44, 45, 46, 47, 48, 49, 50, 51, 53, 54, 55],
  },
];

export function stageProgress(stage, earnedIds) {
  const earned = new Set(earnedIds);
  const done = stage.trophyIds.filter((id) => earned.has(id)).length;
  return { done, total: stage.trophyIds.length };
}

export function stageTrophies(stage, trophiesById) {
  return stage.trophyIds.map((id) => trophiesById.get(id)).filter(Boolean);
}

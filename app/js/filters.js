// Filters for the checklist: by kind (story, missable, collectibles, activities,
// online), by grade, by earned state and by free text — plus the spoiler rule.
export const KIND_LABELS = {
  all: 'All 55',
  story: 'Story',
  missable: 'Missable',
  collectible: 'Collectibles',
  activity: 'Activities',
  online: 'Online',
  earned: 'Earned',
  remaining: 'Remaining',
};

// A story trophy stays hidden (name and description) while spoilers are on and
// the trophy is not earned yet. Non-story trophies are never hidden.
export function isSpoilerHidden(trophy, state) {
  return state.spoiler === true && trophy.spoiler === true && !state.earned.includes(trophy.id);
}

export function trophyMatchesKind(trophy, kind, state) {
  switch (kind) {
    case 'all':
      return true;
    case 'story':
      return trophy.kind === 'story';
    case 'missable':
      return trophy.missable === true;
    case 'collectible':
      return trophy.kind === 'collectible';
    case 'activity':
      return trophy.kind === 'activity';
    case 'online':
      return trophy.kind === 'online';
    case 'earned':
      return state.earned.includes(trophy.id);
    case 'remaining':
      return !state.earned.includes(trophy.id);
    default:
      return true;
  }
}

export function visibleTrophies(trophies, filters, state) {
  const query = filters.query.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (!trophyMatchesKind(trophy, filters.kind, state)) return false;
    if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
    if (query) {
      const hidden = isSpoilerHidden(trophy, state);
      const haystack = hidden
        ? 'hidden story trophy'
        : `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.kind}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function countByGrade(trophies, state) {
  const counts = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const trophy of trophies) {
    counts[trophy.grade][1] += 1;
    if (state.earned.includes(trophy.id)) counts[trophy.grade][0] += 1;
  }
  return counts;
}

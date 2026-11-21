// Views: the checklist with its detail pane, the roadmap, the missables page and
// the settings page. Everything is built with the DOM API, no HTML strings.
import { counterValue } from './store.js';
import { isSpoilerHidden, countByGrade } from './filters.js';
import { ROADMAP_STAGES, stageProgress, stageTrophies } from './roadmap.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function gradeDot(trophy) {
  const dot = el('span', 'grade-dot');
  dot.title = trophy.grade;
  return dot;
}

export function renderScore(doc, state) {
  const earned = state.earned.length;
  document.getElementById('earnedCount').textContent = String(earned);
  const fill = document.getElementById('progressFill');
  fill.style.width = `${Math.round((earned / doc.trophies.length) * 100)}%`;
  const bar = document.getElementById('progressBar');
  bar.setAttribute('aria-valuenow', String(earned));
  const counts = countByGrade(doc.trophies, state);
  document.getElementById('gradeCounts').textContent =
    `Platinum ${counts.platinum[0]}/${counts.platinum[1]} · Gold ${counts.gold[0]}/${counts.gold[1]} · ` +
    `Silver ${counts.silver[0]}/${counts.silver[1]} · Bronze ${counts.bronze[0]}/${counts.bronze[1]}`;
  document.getElementById('missablePill').textContent = String(
    doc.trophies.filter((t) => t.missable).length,
  );
}

function counterStep(trophy) {
  if (trophy.target >= 10000) return 5000;
  if (trophy.target >= 100) return 5;
  return 1;
}

export function renderChecklist(doc, state, filters, selectedId, hooks) {
  const list = document.getElementById('trophyList');
  list.replaceChildren();
  const { visibleTrophies } = hooks;
  const shown = visibleTrophies(doc.trophies, filters, state);
  document.getElementById('listNote').textContent =
    `Showing ${shown.length} of ${doc.trophies.length} trophies` +
    (filters.kind === 'online'
      ? ' — this game has no online trophies: all 55 are single-player (PowerPyx).'
      : '') +
    (state.spoiler ? ' · Spoilers on: story trophies stay hidden until earned.' : '');
  document.getElementById('emptyNote').hidden = shown.length !== 0;

  for (const trophy of shown) {
    const hidden = isSpoilerHidden(trophy, state);
    const earned = state.earned.includes(trophy.id);
    const item = el('li', `trophy grade-${trophy.grade}${earned ? ' earned' : ''}${trophy.id === selectedId ? ' selected' : ''}`);

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned;
    box.setAttribute('aria-label', hidden ? `Mark hidden story trophy ${trophy.id} earned` : `Mark ${trophy.name} earned`);
    box.addEventListener('change', () => hooks.onToggle(trophy.id));
    item.append(box);

    const body = el('div');
    const title = el('h3');
    title.append(gradeDot(trophy));
    title.append(hidden ? `Hidden story trophy #${trophy.id}` : trophy.name);
    body.append(title);
    body.append(el('p', 'desc', hidden
      ? 'Earn this trophy to reveal its official name and description.'
      : trophy.description));
    const meta = el('p', 'meta');
    meta.append(el('span', 'tag', trophy.grade));
    meta.append(el('span', 'tag', trophy.kind));
    if (trophy.missable) meta.append(el('span', 'tag miss', '⚠ Missable'));
    if (earned) meta.append(el('span', 'tag earned-tag', '✓ Earned'));
    if (hidden) meta.append(el('span', 'tag hidden-tag', 'Spoiler hidden'));
    if (trophy.target != null) {
      meta.append(el('span', 'tag', `Target: ${trophy.target.toLocaleString('en-US')}${trophy.target_total ? ` of ${trophy.target_total.toLocaleString('en-US')}` : ''} ${trophy.target_label ?? ''}`));
    }
    body.append(meta);

    if (trophy.target != null) {
      const step = counterStep(trophy);
      const counter = el('div', 'counter');
      const minus = el('button', null, `−${step.toLocaleString('en-US')}`);
      minus.type = 'button';
      minus.addEventListener('click', () => hooks.onCounter(trophy, -step));
      const value = el('b', null, `${counterValue(state, trophy.id).toLocaleString('en-US')} / ${trophy.target.toLocaleString('en-US')}`);
      const plus = el('button', null, `+${step.toLocaleString('en-US')}`);
      plus.type = 'button';
      plus.addEventListener('click', () => hooks.onCounter(trophy, step));
      counter.append(minus, value, plus, el('span', null, trophy.target_label ?? ''));
      body.append(counter);
    }
    item.append(body);

    const guideBtn = el('button', 'guide-btn', hidden ? 'Reveal when earned' : 'Guide');
    guideBtn.type = 'button';
    guideBtn.addEventListener('click', () => hooks.onSelect(trophy.id));
    item.append(guideBtn);
    list.append(item);
  }
}

export function renderDetail(doc, state, selectedId) {
  const pane = document.getElementById('detail');
  pane.replaceChildren();
  const trophy = doc.trophies.find((t) => t.id === selectedId);
  if (!trophy) {
    pane.append(el('h2', null, 'Pick a trophy'));
    pane.append(el('p', 'hint', 'Select any trophy in the list to read its guide and sources here. The guide is written for this entry, in our own words, and every fact in it names where it comes from.'));
    pane.append(el('h4', null, 'Start with'));
    const list = el('ul');
    for (const id of [28, 17, 14]) {
      const t = doc.trophies.find((x) => x.id === id);
      const li = el('li');
      li.append(el('b', null, t.name), document.createTextNode(` — ${t.description}`));
      list.append(li);
    }
    pane.append(list);
    return;
  }
  if (isSpoilerHidden(trophy, state)) {
    pane.append(el('h2', null, `Hidden story trophy #${trophy.id}`));
    pane.append(el('p', 'official', 'Spoilers are on, and this story trophy is not earned yet.'));
    pane.append(el('p', 'guide-text', 'Its name, description and guide stay hidden until you earn it — or turn spoilers off in Settings. Tick it earned in the checklist to reveal it.'));
    return;
  }
  pane.append(el('h2', null, trophy.name));
  pane.append(el('p', 'official', `${trophy.description} — ${trophy.grade}, ${trophy.kind}${trophy.missable ? ', MISSABLE' : ''}.`));
  if (trophy.missable) {
    pane.append(el('p', 'warn', '⚠ Potentially missable — the only one in the game. Read the warning in the guide and do it before you leave Chapter 1.'));
  }
  pane.append(el('h4', null, 'Guide'));
  pane.append(el('p', 'guide-text', trophy.guide));
  pane.append(el('h4', null, 'Sources — where each fact comes from'));
  const sources = el('ul');
  for (const source of trophy.sources) {
    const li = el('li');
    const link = document.createElement('a');
    link.href = source.url;
    link.textContent = source.name;
    link.target = '_blank';
    link.rel = 'noopener';
    li.append(link);
    sources.append(li);
  }
  pane.append(sources);
  pane.append(el('p', 'hint', 'The app itself fetches nothing: a source opens only if you follow its link. Official names and descriptions are shown as PlayStation publishes them; everything else is this guide\u2019s own words.'));
}

export function renderRoadmap(doc, state) {
  const section = document.getElementById('view-roadmap');
  section.replaceChildren();
  const byId = new Map(doc.trophies.map((t) => [t.id, t]));

  const intro = el('div', 'card');
  intro.style.marginBottom = '14px';
  intro.append(el('h2', null, 'Roadmap to the platinum — Vice Got a Price!'));
  const introText = el('p', null, 'Difficulty 4/10 · about 200 hours (PowerPyx; Push Square puts the top end near 300) · 5 story chapters · 0 online trophies · no difficulty setting · no mission replay · free-roam after the story. One playthrough is enough, and the platinum pops the moment the other 54 trophies are done.');
  intro.append(introText);
  section.append(intro);

  const warn = el('div', 'callout');
  warn.append(el('h3', null, 'Before you start'));
  warn.append(el('p', null, 'Cheats disable trophies and saving — leave them off for a trophy run (GTABase). Save manually at the start and end of every chapter: missions cannot be replayed (GTASpotter). And do the Chapter 1 balcony meditation — it is the one thing that may be missable (PowerPyx).'));
  section.append(warn);

  for (const stage of ROADMAP_STAGES) {
    const progress = stageProgress(stage, state.earned);
    const card = el('div', 'stage');
    const head = el('h2', null, `${stage.title} `);
    head.append(el('span', 'hours', `· ${stage.hours}`));
    card.append(head);
    card.append(el('p', null, stage.text));
    const names = stageTrophies(stage, byId).map((t) =>
      `${state.earned.includes(t.id) ? '✓ ' : ''}${t.name}`).join(' · ');
    card.append(el('p', 'trophy-names', names));
    const bar = el('div', 'bar');
    const fill = el('span');
    fill.style.width = `${Math.round((progress.done / progress.total) * 100)}%`;
    bar.append(fill);
    card.append(bar);
    card.append(el('p', 'trophy-names', `${progress.done} of ${progress.total} trophies in this stage earned.`));
    section.append(card);
  }
}

export function renderMissables(doc, state) {
  const section = document.getElementById('view-missables');
  section.replaceChildren();
  const missable = doc.trophies.filter((t) => t.missable);
  const danger = el('div', 'callout danger');
  danger.append(el('h2', null, `${missable.length} potentially missable trophy`));
  danger.append(el('p', null, 'Every other trophy in the game can be earned after the story in free-roam. Only one needs care while you play.'));
  section.append(danger);
  for (const trophy of missable) {
    const card = el('div', 'card');
    card.style.marginBottom = '14px';
    card.append(el('h2', null, `⚠ ${trophy.name} — ${trophy.grade}`));
    card.append(el('p', null, trophy.description));
    card.append(el('p', null, trophy.guide));
    const link = document.createElement('a');
    link.href = 'https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/';
    link.textContent = 'PowerPyx — first meditation missable in Chapter 1';
    link.target = '_blank';
    link.rel = 'noopener';
    const p = el('p', null, 'Source: ');
    p.append(link);
    card.append(p);
    section.append(card);
  }
  const safe = el('div', 'card');
  safe.append(el('h2', null, 'Everything else is safe'));
  safe.append(el('p', null, 'Story and chapter trophies pop as you play the missions — none can be missed. Nothing on the 100% Completion checklist is missable, and progress made before the story ends already counts (GTABase). After the credits you stay in free-roam, every quest giver tied to a trophy comes back, and all collectibles, races, robberies and activities stay open. The only standing warnings are the ones above: keep cheats off, and save manually at each chapter boundary.'));
  section.append(safe);
}

export function renderSettings(doc, state, hooks) {
  const section = document.getElementById('view-settings');
  section.replaceChildren();
  const grid = el('div', 'settings-grid');

  const spoilerCard = el('div', 'card');
  spoilerCard.append(el('h2', null, 'Spoilers'));
  spoilerCard.append(el('p', null, 'When spoilers are on, the 17 story trophies — chapters, missions and character finales — show as “Hidden story trophy” with no name or description until you earn them. Collectibles, activities and miscellaneous trophies are never hidden.'));
  const label = el('label', 'spoiler-toggle');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = state.spoiler;
  box.addEventListener('change', () => hooks.onSpoiler(box.checked));
  label.append(box, document.createTextNode(' Hide story spoilers until earned'));
  spoilerCard.append(label);
  spoilerCard.append(el('p', null, state.spoiler
    ? 'Spoilers are ON right now: go to the Checklist and the story trophies you have not earned will be hidden.'
    : 'Spoilers are OFF right now: every trophy shows its official name and description.'));
  grid.append(spoilerCard);

  const saveCard = el('div', 'card');
  saveCard.append(el('h2', null, 'Your progress is saved in this browser'));
  saveCard.append(el('p', null, 'Ticks, counters and settings are stored in localStorage on this device — nothing leaves the browser. Export a backup file before you clear browser data, and import it back to restore.'));
  const exportBtn = el('button', 'btn', 'Export progress (.json)');
  exportBtn.type = 'button';
  exportBtn.addEventListener('click', hooks.onExport);
  saveCard.append(exportBtn);
  const importLabel = el('label', 'btn ghost import-label', 'Import progress');
  const importInput = document.createElement('input');
  importInput.type = 'file';
  importInput.accept = 'application/json,.json';
  importInput.addEventListener('change', () => {
    if (importInput.files[0]) hooks.onImport(importInput.files[0]);
    importInput.value = '';
  });
  importLabel.append(importInput);
  saveCard.append(importLabel);
  const resetBtn = el('button', 'btn danger', 'Reset all progress');
  resetBtn.type = 'button';
  resetBtn.addEventListener('click', hooks.onReset);
  saveCard.append(resetBtn);
  saveCard.append(el('p', null, `Currently saved: ${state.earned.length} of ${doc.trophies.length} trophies earned.`));
  grid.append(saveCard);

  const aboutCard = el('div', 'card');
  aboutCard.append(el('h2', null, 'About this list'));
  aboutCard.append(el('p', null, '55 trophies: 1 platinum, 2 gold, 6 silver, 46 bronze. 28 are hidden on PlayStation until earned. There are no online trophies — all 55 are single-player (PowerPyx).'));
  aboutCard.append(el('p', null, 'Names, descriptions and grades come from the official list as Exophase and PSNProfiles publish it; counts (42 shooting-range challenges, 250 stunts, 14 drone races, 18 meditation spots and the rest) are PSN\u2019s progress targets via PSNProfiles. Each trophy\u2019s guide is written for this entry and cites its sources beside it.'));
  const sourceList = el('ul');
  for (const source of doc.list_sources ?? []) {
    const li = el('li');
    const link = document.createElement('a');
    link.href = source.url;
    link.textContent = source.name;
    link.target = '_blank';
    link.rel = 'noopener';
    li.append(link);
    sourceList.append(li);
  }
  aboutCard.append(sourceList);
  grid.append(aboutCard);

  const honestCard = el('div', 'card');
  honestCard.append(el('h2', null, 'What this guide does not claim'));
  honestCard.append(el('p', null, 'The game came out on 19 November 2026 and this guide was built from the official trophy list and the published guides cited beside each trophy — not from a finished playthrough. Where a place or step is not pinned down by a cited source, the guide says so instead of guessing: a cited guide beats an uncited one, however detailed.'));
  grid.append(honestCard);

  section.append(grid);
}

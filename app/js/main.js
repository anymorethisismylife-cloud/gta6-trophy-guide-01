// Boot for the Leonida Ledger: loads the trophy data, wires the checklist,
// the detail pane, the roadmap, the missables page and settings, and routes
// between them on the hash (#/checklist, #/roadmap, #/missables, #/settings,
// #/trophy/<id> opens the checklist with that trophy's guide beside it).
import {
  loadState,
  saveState,
  toggleEarned,
  setCounter,
  setSpoiler,
  exportProgress,
  importProgressFile,
  resetProgress,
  counterValue,
} from './store.js';
import { visibleTrophies } from './filters.js';
import {
  renderScore,
  renderChecklist,
  renderDetail,
  renderRoadmap,
  renderMissables,
  renderSettings,
} from './views.js';

const doc = await (await fetch('data/trophies.json')).json();
let state = loadState();
let selectedId = null;
const filters = { kind: 'all', grade: 'all', query: '' };

const views = ['checklist', 'roadmap', 'missables', 'settings'];

function showView(name) {
  for (const view of views) {
    document.getElementById(`view-${view}`).hidden = view !== name;
    document.getElementById(`tab-${view}`).classList.toggle('on', view === name);
  }
}

function renderAll() {
  renderScore(doc, state);
  renderChecklist(doc, state, filters, selectedId, checklistHooks);
  renderDetail(doc, state, selectedId);
  renderRoadmap(doc, state);
  renderMissables(doc, state);
  renderSettings(doc, state, settingsHooks);
}

const checklistHooks = {
  visibleTrophies,
  onToggle(id) {
    state = toggleEarned(state, id);
    renderAll();
  },
  onCounter(trophy, delta) {
    state = setCounter(state, trophy, counterValue(state, trophy.id) + delta);
    renderAll();
  },
  onSelect(id) {
    selectedId = id;
    location.hash = `#/trophy/${id}`;
    renderAll();
    document.getElementById('detail').scrollIntoView({ block: 'nearest' });
  },
};

const settingsHooks = {
  onSpoiler(on) {
    state = setSpoiler(state, on);
    document.getElementById('spoiler').checked = on;
    renderAll();
  },
  onExport() {
    exportProgress(state);
  },
  async onImport(file) {
    try {
      state = await importProgressFile(file, doc.trophies.map((t) => t.id));
      saveState(state);
    } catch {
      alert('That file is not a Leonida Ledger progress file.');
    }
    renderAll();
  },
  onReset() {
    if (confirm('Clear every earned trophy, counter and setting?')) {
      state = resetProgress();
      selectedId = null;
      renderAll();
    }
  },
};

function routeFromHash() {
  const hash = location.hash || '#/checklist';
  const match = hash.match(/^#\/trophy\/(\d+)$/);
  if (match) {
    selectedId = Number(match[1]);
    showView('checklist');
    return;
  }
  const view = hash.replace(/^#\//, '');
  if (views.includes(view)) {
    if (view !== 'checklist') selectedId = null;
    showView(view);
  } else {
    showView('checklist');
  }
}

document.getElementById('search').addEventListener('input', (event) => {
  filters.query = event.target.value;
  renderChecklist(doc, state, filters, selectedId, checklistHooks);
});
document.getElementById('grade').addEventListener('change', (event) => {
  filters.grade = event.target.value;
  renderChecklist(doc, state, filters, selectedId, checklistHooks);
});
document.getElementById('spoiler').addEventListener('change', (event) => {
  state = setSpoiler(state, event.target.checked);
  renderAll();
});
document.getElementById('chips').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-kind]');
  if (!button) return;
  filters.kind = button.dataset.kind;
  for (const chip of document.querySelectorAll('#chips button')) {
    chip.classList.toggle('on', chip === button);
  }
  renderChecklist(doc, state, filters, selectedId, checklistHooks);
});
for (const view of views) {
  document.getElementById(`tab-${view}`).addEventListener('click', () => {
    location.hash = `#/${view}`;
  });
}
window.addEventListener('hashchange', () => {
  routeFromHash();
  renderAll();
});

document.getElementById('spoiler').checked = state.spoiler;
routeFromHash();
renderAll();

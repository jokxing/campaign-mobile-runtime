type CampaignListState = {
  category: string;
  scrollY: number;
  anchorId: string;
  pending: boolean;
};

const storageKey = 'campaign-list-navigation-state';

function readState(): CampaignListState | null {
  if (!import.meta.client) return null;

  try {
    const value = sessionStorage.getItem(storageKey);
    return value ? (JSON.parse(value) as CampaignListState) : null;
  } catch {
    return null;
  }
}

function writeState(state: CampaignListState) {
  if (import.meta.client) sessionStorage.setItem(storageKey, JSON.stringify(state));
}

export function useCampaignListRestore() {
  const savedState = readState();

  function rememberCategory(category: string) {
    const current = readState();
    writeState({ category, scrollY: current?.scrollY || 0, anchorId: current?.anchorId || '', pending: false });
  }

  function saveBeforeNavigate(anchorId: string, category: string) {
    writeState({ category, scrollY: window.scrollY, anchorId, pending: true });
  }

  function clearPosition(category: string) {
    writeState({ category, scrollY: 0, anchorId: '', pending: false });
  }

  function restorePosition() {
    const state = readState();
    if (!state?.pending) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const anchor = state.anchorId
          ? document.querySelector<HTMLElement>(`[data-campaign-id="${CSS.escape(state.anchorId)}"]`)
          : null;
        if (anchor && document.documentElement.scrollHeight < state.scrollY + window.innerHeight) {
          anchor.scrollIntoView({ block: 'center' });
        } else {
          window.scrollTo({ top: state.scrollY });
        }
        writeState({ ...state, pending: false });
      });
    });
  }

  return { savedState, rememberCategory, saveBeforeNavigate, clearPosition, restorePosition };
}

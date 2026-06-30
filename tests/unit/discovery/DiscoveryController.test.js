/**
 * @vitest-environment jsdom
 * Unit tests for DiscoveryController orchestrator
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../setup.js';

const discoveryControllerSource = await import('../../js/discovery/DiscoveryController.js?raw').then(
  m => m.default
);
eval(discoveryControllerSource);

const mockItems = [
  {
    id: 'essay-1',
    chamber: 'akademia',
    chamberName: 'AKADEMIA',
    chamberColor: '#00ffff',
    title: 'Digital Garden',
    subtitle: 'Draft',
    description:
      'A long description explaining how discovery works across the portfolio',
    tags: ['digital', 'journal'],
    type: 'text',
  },
  {
    id: 'album-1',
    chamber: 'odeion',
    chamberName: 'ODEION',
    chamberColor: '#ff00ff',
    title: 'Neon Album',
    description: 'A short album description',
    tags: ['music'],
    type: 'audio',
  },
];

const mockTags = [
  { tag: 'digital', count: 5 },
  { tag: 'music', count: 3 },
];

const defaultConfig = {
  search: {
    minQueryLength: 2,
    debounceMs: 50,
  },
  pagination: {
    itemsPerPage: 4,
    maxPageButtons: 7,
  },
  filters: {
    maxTagsShown: 20,
  },
  ui: {
    quickFilters: [
      { id: 'all', label: 'All', criteria: {} },
      { id: 'audio', label: 'Audio', criteria: { types: ['audio'] } },
      { id: 'text', label: 'Text', criteria: { types: ['text'] } },
    ],
  },
  shortcuts: {},
};

describe('DiscoveryController', () => {
  let controller;
  let registry;
  let searchEngine;
  let filterSystem;
  let shareLinks;

  const buildDom = () => {
    document.body.innerHTML = `
      <div id="discoverySearchInput"></div>
      <div id="resultsGrid"></div>
      <div id="pagination"></div>
      <div id="tagCloud"></div>
      <div id="quickFilters"></div>
      <div id="filterPanel"></div>
      <div id="chamberFilters"></div>
      <div id="typeFilters"></div>
      <div id="wingFilters"></div>
      <input id="yearFromInput" />
      <input id="yearToInput" />
      <button id="clearFiltersBtn"></button>
      <div id="filterSummary"></div>
      <div id="resultCount"></div>
      <select id="sortSelect">
        <option value="relevance-desc">Relevance</option>
      </select>
      <div id="recommendationsGrid"></div>
      <div id="searchModal" class="dn"></div>
      <input id="globalSearchInput" />
      <div id="globalSearchResults"></div>
    `;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    buildDom();
    vi.restoreAllMocks();

    global.ETCETER4_CONFIG = { discovery: defaultConfig };

    registry = {
      isInitialized: false,
      async initialize() {
        this.isInitialized = true;
        return this;
      },
      getAllItems() {
        return mockItems;
      },
      getItem: vi
        .fn()
        .mockImplementation(id => mockItems.find(item => item.id === id)),
      getAllTags: vi
        .fn()
        .mockImplementation(limit => mockTags.slice(0, limit)),
    };

    searchEngine = {
      async initialize() {
        return this;
      },
      searchDebounced: vi.fn().mockResolvedValue([
        {
          item: mockItems[0],
        },
      ]),
      search: vi.fn().mockImplementation(() => [{ item: mockItems[0] }]),
    };

    filterSystem = {
      initialize: vi.fn().mockReturnValue(filterSystem),
      onChange: vi.fn(),
      offChange: vi.fn(),
      getFilteredItems: vi.fn().mockReturnValue(mockItems),
      getSummaryText: vi.fn().mockReturnValue('No filters active'),
      getState: vi.fn().mockReturnValue({
        tags: ['digital'],
        chambers: [],
        types: [],
        wings: [],
        fromYear: null,
        toYear: null,
      }),
      setSort: vi.fn(),
      setDateRange: vi.fn(),
      setTags: vi.fn(),
      setChambers: vi.fn(),
      setTypes: vi.fn(),
      clearAll: vi.fn(),
      toggleTag: vi.fn(),
    };

    shareLinks = {
      getItemIdFromUrl: vi.fn().mockReturnValue(null),
      shareItem: vi.fn(),
    };

    global.ContentRegistry = {
      getInstance: vi.fn().mockReturnValue(registry),
    };
    global.SearchEngine = {
      getInstance: vi.fn().mockReturnValue(searchEngine),
    };
    global.FilterSystem = {
      getInstance: vi.fn().mockReturnValue(filterSystem),
    };
    global.RelatedWorksEngine = {
      getInstance: vi.fn().mockReturnValue({
        initialize: vi.fn(),
      }),
    };
    global.ShareLinks = {
      getInstance: vi.fn().mockReturnValue(shareLinks),
    };
    global.showNewSection = vi.fn();
    window.sessionStorage.clear();

    delete window.discoveryControllerInstance;
    controller = DiscoveryController.getInstance();
  });

  afterEach(() => {
    if (controller) {
      controller.dispose();
    }

    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();

    delete window.discoveryControllerInstance;
    delete global.ContentRegistry;
    delete global.SearchEngine;
    delete global.FilterSystem;
    delete global.RelatedWorksEngine;
    delete global.ShareLinks;
    delete global.showNewSection;
    delete global.ETCETER4_CONFIG;
    document.body.innerHTML = '';
  });

  it('should expose a singleton via getInstance()', () => {
    const first = DiscoveryController.getInstance();
    const second = DiscoveryController.getInstance();

    expect(first).toBe(second);
    expect(first).toBe(controller);
  });

  it('should initialize subsystems and render initial UI state', async () => {
    await controller.initialize();

    expect(registry.initialize).toHaveBeenCalledTimes(1);
    expect(searchEngine.initialize).toHaveBeenCalledTimes(1);
    expect(filterSystem.initialize).toHaveBeenCalledTimes(1);
    expect(controller.isInitialized).toBe(true);
    expect(controller.elements.resultsGrid.innerHTML).toContain('No items found');
    expect(controller.elements.tagCloud.querySelectorAll('.tag-btn')).toHaveLength(
      2
    );
    expect(controller.elements.quickFilters.querySelectorAll('button')).toHaveLength(
      3
    );
  });

  it('should not reinitialize when already initialized', async () => {
    await controller.initialize();
    await controller.initialize();

    expect(searchEngine.initialize).toHaveBeenCalledTimes(1);
    expect(filterSystem.initialize).toHaveBeenCalledTimes(1);
  });

  it('should update search results on debounced search input', async () => {
    await controller.initialize();
    await controller._onSearchInput({
      target: { value: 'digi' },
    });

    expect(searchEngine.searchDebounced).toHaveBeenCalledWith('digi', undefined);
    expect(controller.currentSearchQuery).toBe('digi');
    expect(controller.currentResults).toEqual([{ item: mockItems[0] }]);
  });

  it('should fallback to filtered items on empty search input', async () => {
    await controller.initialize();
    filterSystem.getFilteredItems.mockClear();
    controller.currentSearchQuery = 'digi';
    await controller._onSearchInput({
      target: { value: '' },
    });

    expect(filterSystem.getFilteredItems).toHaveBeenCalled();
    expect(controller.currentSearchQuery).toBe('');
    expect(controller.currentResults).toEqual(mockItems);
  });

  it('should ignore search input shorter than the configured minimum', async () => {
    await controller.initialize();
    filterSystem.getFilteredItems.mockClear();

    await controller._onSearchInput({
      target: { value: 'd' },
    });

    expect(searchEngine.searchDebounced).not.toHaveBeenCalled();
    expect(filterSystem.getFilteredItems).not.toHaveBeenCalled();
    expect(controller.currentSearchQuery).toBe('d');
  });

  it('should handle filter changes in search mode and non-search mode', () => {
    controller.currentSearchQuery = '';
    filterSystem.getFilteredItems.mockReturnValue([mockItems[1]]);
    controller._onFilterChange({
      tags: ['music'],
      chambers: [],
      types: [],
      wings: [],
    });

    expect(controller.currentResults).toEqual([mockItems[1]]);
  });

  it('should generate pagination ranges for start, middle, and end windows', () => {
    expect(controller._getPaginationRange(1, 10, 7)).toEqual([
      1,
      2,
      3,
      4,
      5,
      '...',
      10,
    ]);
    expect(controller._getPaginationRange(5, 10, 7)).toEqual([
      1,
      '...',
      3,
      4,
      5,
      6,
      7,
      '...',
      10,
    ]);
    expect(controller._getPaginationRange(10, 10, 7)).toEqual([
      1,
      '...',
      6,
      7,
      8,
      9,
      10,
    ]);
  });

  it('should escape HTML and truncate long text deterministically', () => {
    expect(controller._escapeHtml('<x>&\"')).toBe('&lt;x&gt;&amp;&quot;');
    expect(controller._truncate('A very long line of text', 5)).toBe('A ver...');
    expect(controller._truncate('short', 10)).toBe('short');
  });

  it('should return expected type icons', () => {
    expect(controller._getTypeIcon('audio')).toBe('🎵');
    expect(controller._getTypeIcon('archive')).toBe('📚');
    expect(controller._getTypeIcon('unknown')).toBe('📄');
  });

  it('should open and close search modal and preserve selected index state', () => {
    controller.openSearchModal();
    expect(controller.isSearchModalOpen).toBe(true);
    expect(controller.elements.searchModal.classList.contains('db')).toBe(true);
    expect(controller.selectedResultIndex).toBe(-1);
    expect(document.body.style.overflow).toBe('hidden');

    controller.closeSearchModal();
    expect(controller.isSearchModalOpen).toBe(false);
    expect(controller.elements.searchModal.classList.contains('dn')).toBe(true);
    expect(controller.selectedResultIndex).toBe(-1);
    expect(document.body.style.overflow).toBe('');
  });

  it('should emit navigation to item on global search selection', async () => {
    await controller.initialize();
    controller.openSearchModal();
    controller.currentResults = [mockItems[0]];
    controller._renderGlobalSearchResults([
      {
        item: mockItems[0],
        highlights: {},
      },
    ]);

    controller._selectResult(0);

    expect(global.showNewSection).toHaveBeenCalledWith('#AKADEMIA');
  });

  it('should support keyboard navigation in global search results', () => {
    controller.openSearchModal();
    controller.currentResults = [mockItems[0], mockItems[1]];
    controller._renderGlobalSearchResults([
      { item: mockItems[0], highlights: {} },
      { item: mockItems[1], highlights: {} },
    ]);

    controller._onKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() });
    expect(controller.selectedResultIndex).toBe(0);

    controller._onKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() });
    expect(controller.selectedResultIndex).toBe(1);

    controller._onKeyDown({ key: 'ArrowUp', preventDefault: vi.fn() });
    expect(controller.currentResults).toEqual([mockItems[0], mockItems[1]]);
    expect(controller.selectedResultIndex).toBe(0);
  });

  it('should navigate to shared item when present in URL on initialize', async () => {
    shareLinks.getItemIdFromUrl.mockReturnValue('album-1');

    await controller.initialize();
    vi.advanceTimersByTime(500);

    expect(showNewSection).toHaveBeenCalledWith('#ODEION');
  });

  it('should navigate to item when share function exists and fallback to hash when absent', () => {
    controller.dispose();
    global.showNewSection = undefined;
    window.location.hash = '#baseline';
    delete window.discoveryControllerInstance;
    controller = DiscoveryController.getInstance();
    controller._navigateToItem('album-1');

    expect(window.location.hash).toBe('#ODEION');
  });

  it('should return status and dispose listeners', async () => {
    const clearButton = document.getElementById('clearFiltersBtn');
    const keydownSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const clearSpy = vi.spyOn(clearButton, 'addEventListener');

    await controller.initialize();

    const status = controller.getStatus();

    expect(status.isInitialized).toBe(true);
    expect(status.isSearchModalOpen).toBe(false);

    controller.dispose();

    expect(filterSystem.offChange).toHaveBeenCalledWith(
      controller._onFilterChange
    );
    expect(removeSpy).toHaveBeenCalledWith('keydown', controller._onKeyDown);
    expect(keydownSpy).toHaveBeenCalledWith('keydown', controller._onKeyDown);
    expect(clearButton).not.toBeNull();
    expect(clearSpy).toHaveBeenCalledWith('click', expect.any(Function));
    expect(controller.currentResults).toEqual([]);
    expect(controller.isInitialized).toBe(false);

    expect(keydownSpy).toHaveBeenCalledWith('keydown', controller._onKeyDown);
    expect(clearSpy).toHaveBeenCalledWith('click', expect.any(Function));
  });
});

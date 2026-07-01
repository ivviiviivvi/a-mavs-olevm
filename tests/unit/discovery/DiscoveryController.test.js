/**
 * @vitest-environment jsdom
 * Unit tests for DiscoveryController
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';
import '../setup.js';

const DiscoveryControllerSource = await import(
  '../../../js/discovery/DiscoveryController.js?raw'
).then(m => m.default);

eval(DiscoveryControllerSource);

describe('DiscoveryController', () => {
  let controller;
  let mockRegistry;
  let mockSearchEngine;
  let mockFilterSystem;
  let mockRelatedWorks;
  let mockShareLinks;

  const createTestItem = (id, overrides = {}) => ({
    id,
    chamber: 'akademia',
    chamberName: 'AKADEMIA',
    chamberColor: '#00ffff',
    type: 'text',
    tags: ['tag-a'],
    title: `Item ${id}`,
    description: 'A short test item description for discovery UI coverage.',
    ...overrides,
  });

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="searchModal" class="dn">
        <input id="globalSearchInput" />
        <div id="globalSearchResults"></div>
      </div>
      <input id="discoverySearchInput" />
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
      <select id="sortSelect"></select>
      <div id="recommendationsGrid"></div>
    `;

    mockRegistry = {
      items: [
        createTestItem('item-a', {
          title: 'First Item',
          type: 'text',
          tags: ['tag-a'],
          description: 'First item description',
        }),
        createTestItem('item-b', {
          title: 'Second Item',
          type: 'audio',
          tags: ['tag-b'],
          description: 'Second item description',
        }),
      ],
      initialize: vi.fn(async () => undefined),
      getItem: vi.fn(id => mockRegistry.items.find(item => item.id === id) || null),
      getFilteredItems: vi.fn(() => [mockRegistry.items[0]]),
      getAllTags: vi.fn(() => [
        { tag: 'tag-a', count: 3 },
        { tag: 'tag-b', count: 1 },
      ]),
    };

    mockSearchEngine = {
      initialize: vi.fn(async () => undefined),
      searchDebounced: vi.fn(async query => [
        {
          item: mockRegistry.items[0],
          highlights: {
            title: `Highlighted ${query}`,
            description: `Matched ${query}`,
          },
        },
      ]),
      search: vi.fn(() => [
        {
          item: mockRegistry.items[1],
        },
      ]),
    };

    mockFilterSystem = {
      initialize: vi.fn(),
      onChange: vi.fn(),
      offChange: vi.fn(),
      getFilteredItems: vi.fn(() => [mockRegistry.items[0], mockRegistry.items[1]]),
      getState: vi.fn(() => ({
        tags: ['tag-a'],
        fromYear: 2022,
        toYear: 2025,
      })),
      getSummaryText: vi.fn(() => 'tag-a'),
      clearAll: vi.fn(),
      setTypes: vi.fn(),
      setChambers: vi.fn(),
      setTags: vi.fn(),
      toggleTag: vi.fn(),
      setDateRange: vi.fn(),
      setSort: vi.fn(),
    };

    mockRelatedWorks = {
      initialize: vi.fn(),
    };

    mockShareLinks = {
      getItemIdFromUrl: vi.fn(() => null),
      shareItem: vi.fn(),
    };

    global.ContentRegistry = { getInstance: vi.fn(() => mockRegistry) };
    global.SearchEngine = { getInstance: vi.fn(() => mockSearchEngine) };
    global.FilterSystem = { getInstance: vi.fn(() => mockFilterSystem) };
    global.RelatedWorksEngine = {
      getInstance: vi.fn(() => mockRelatedWorks),
    };
    global.ShareLinks = { getInstance: vi.fn(() => mockShareLinks) };
    global.ETCETER4_CONFIG = {
      discovery: {
        search: {
          minQueryLength: 2,
        },
        pagination: {
          itemsPerPage: 2,
          maxPageButtons: 5,
        },
      },
    };

    vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    delete window.discoveryControllerInstance;
    delete global.showNewSection;
    document.body.innerHTML = '';
  });

  it('enforces singleton behavior', () => {
    const first = DiscoveryController.getInstance();
    const second = DiscoveryController.getInstance();

    expect(first).toBe(second);
    expect(first).toBeInstanceOf(DiscoveryController);
  });

  it('initializes all dependencies and cached UI elements', async () => {
    const keydownSpy = vi.spyOn(document, 'addEventListener');

    controller = DiscoveryController.getInstance();
    const initializeSpy = vi.spyOn(controller, 'initialize');

    await controller.initialize();

    expect(mockRegistry.initialize).toHaveBeenCalled();
    expect(mockSearchEngine.initialize).toHaveBeenCalled();
    expect(mockFilterSystem.initialize).toHaveBeenCalled();
    expect(mockRelatedWorks.initialize).toHaveBeenCalled();
    expect(controller.elements).toMatchObject({
      searchInput: document.getElementById('discoverySearchInput'),
      resultsGrid: document.getElementById('resultsGrid'),
      tagCloud: document.getElementById('tagCloud'),
      quickFilters: document.getElementById('quickFilters'),
      globalSearchInput: document.getElementById('globalSearchInput'),
      globalSearchResults: document.getElementById('globalSearchResults'),
    });
    expect(controller.isInitialized).toBe(true);
    expect(controller.getStatus().isInitialized).toBe(true);
    expect(mockFilterSystem.onChange).toHaveBeenCalledWith(
      controller._onFilterChange
    );
    expect(keydownSpy).toHaveBeenCalledWith('keydown', controller._onKeyDown);
    expect(initializeSpy).toHaveBeenCalled();
  });

  it('handles discovery search input with debounced search', async () => {
    controller = new DiscoveryController();
    await controller.initialize();

    await controller._onSearchInput({ target: { value: 'art' } });

    expect(controller.currentSearchQuery).toBe('art');
    expect(mockSearchEngine.searchDebounced).toHaveBeenCalledWith('art');
    expect(controller.currentResults).toEqual([mockRegistry.items[0]]);
    expect(document.getElementById('resultCount').textContent).toBe('1 items');
    expect(document.getElementById('resultsGrid').innerHTML).toContain('item-a');

    await controller._onSearchInput({ target: { value: '' } });
    expect(mockFilterSystem.getFilteredItems).toHaveBeenCalled();
    expect(controller.currentSearchQuery).toBe('');
    expect(controller.currentResults).toEqual([mockRegistry.items[0]]);
  });

  it('handles filter changes in search and non-search modes', async () => {
    controller = new DiscoveryController();
    await controller.initialize();

    controller.currentSearchQuery = '';
    controller._onFilterChange({ tags: ['tag-a'], fromYear: 2020, toYear: 2025 });

    expect(mockFilterSystem.getFilteredItems).toHaveBeenCalled();
    expect(controller.currentResults).toEqual([
      mockRegistry.items[0],
      mockRegistry.items[1],
    ]);
    expect(mockFilterSystem.getState).toHaveBeenCalled();
    expect(document.getElementById('filterSummary').textContent).toBe('tag-a');

    mockSearchEngine.search.mockClear();
    controller.currentSearchQuery = 'art';
    controller._onFilterChange({ tags: ['tag-b'], fromYear: null, toYear: null });

    expect(mockSearchEngine.search).toHaveBeenCalledWith('art', {
      filter: { tags: ['tag-b'], fromYear: null, toYear: null },
    });
    expect(controller.currentResults).toEqual([mockRegistry.items[1]]);
  });

  it('opens and closes global search modal and handles escape', async () => {
    const focusSpy = vi.spyOn(
      document.getElementById('globalSearchInput'),
      'focus'
    );

    controller = new DiscoveryController();
    await controller.initialize();

    controller.openSearchModal();
    expect(controller.isSearchModalOpen).toBe(true);
    expect(controller.selectedResultIndex).toBe(-1);
    expect(document.getElementById('searchModal').classList.contains('db')).toBe(true);
    expect(document.getElementById('searchModal').classList.contains('dn')).toBe(false);
    expect(document.body.style.overflow).toBe('hidden');
    expect(focusSpy).toHaveBeenCalled();

    controller._onKeyDown({
      key: 'k',
      metaKey: false,
      ctrlKey: false,
      preventDefault: vi.fn(),
    });
    controller._onKeyDown({
      key: 'Escape',
      preventDefault: vi.fn(),
    });
    expect(controller.isSearchModalOpen).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('supports keyboard-driven navigation and selection from global search results', async () => {
    controller = new DiscoveryController();
    await controller.initialize();

    controller.openSearchModal();
    controller._renderGlobalSearchResults([
      { item: mockRegistry.items[0] },
      { item: createTestItem('item-c', { title: 'Third Item', tags: ['tag-c'] }) },
    ]);

    const navigateSpy = vi.spyOn(controller, '_navigateToItem');

    controller._onKeyDown({
      key: 'ArrowDown',
      preventDefault: vi.fn(),
    });
    expect(controller.selectedResultIndex).toBe(0);

    controller._onKeyDown({
      key: 'ArrowDown',
      preventDefault: vi.fn(),
    });
    expect(controller.selectedResultIndex).toBe(1);

    const enterEvent = {
      key: 'Enter',
      preventDefault: vi.fn(),
    };
    controller._onKeyDown({
      ...enterEvent,
      key: 'Enter',
    });

    expect(navigateSpy).toHaveBeenCalledWith('item-c');
  });

  it('navigates to an item and stores highlight marker', async () => {
    controller = new DiscoveryController();
    await controller.initialize();

    window.showNewSection = vi.fn();
    controller._navigateToItem('item-b');

    expect(mockRegistry.getItem).toHaveBeenCalledWith('item-b');
    expect(sessionStorage.getItem('etceter4-highlight-item')).toBe('item-b');
    expect(window.showNewSection).toHaveBeenCalledWith('#akademia');
  });

  it('renders result cards and pagination boundaries', async () => {
    controller = new DiscoveryController();
    controller.currentResults = Array.from({ length: 5 }, (_, i) =>
      createTestItem(`item-${i}`, {
        chamber: `chamber-${i}`,
        chamberName: `Chamber ${i}`,
        title: `Result ${i}`,
      })
    );

    vi.spyOn(controller, '_renderResultCard').mockImplementation(item =>
      `<article class="result-card" data-item-id="${item.id}">${item.title}</article>`
    );

    await controller.initialize();
    controller._renderResults();

    expect(document.getElementById('resultCount').textContent).toBe('5 items');
    expect(document.getElementById('resultsGrid').children.length).toBe(2);

    const pages = controller._getPaginationRange(1, 3, 5);
    expect(pages).toEqual([1, 2, 3]);

    controller._renderPagination(0);
    expect(document.getElementById('pagination').innerHTML).toBe('');
  });

  it('disposes lifecycle listeners and resets state', async () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    controller = new DiscoveryController();
    await controller.initialize();

    controller.dispose();

    expect(removeSpy).toHaveBeenCalledWith('keydown', controller._onKeyDown);
    expect(mockFilterSystem.offChange).toHaveBeenCalledWith(
      controller._onFilterChange
    );
    expect(controller.isInitialized).toBe(false);
    expect(controller.currentResults).toEqual([]);
  });
});

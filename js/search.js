let searchTimeout = null;
let currentSort = 'new';
let filterServer = null;
let filterCategory = null;
let filterPriceMin = null;
let filterPriceMax = null;

window.addEventListener('DOMContentLoaded', async () => {
  Telegram.WebApp.ready();
    Telegram.WebApp.expand();
      await loadFilterOptions();
      });

      async function loadFilterOptions() {
        const [servers, categories] = await Promise.all([getServers(), getCategories()]);

          document.getElementById('filterServers').innerHTML =
              `<div class="filter-chip ${!filterServer ? 'active' : ''}" onclick="setFilterServer(null, this)">Все</div>` +
                  servers.map(s =>
                        `<div class="filter-chip ${filterServer === s.id ? 'active' : ''}" onclick="setFilterServer(${s.id}, this)">${s.name}</div>`
                            ).join('');

                              document.getElementById('filterCategories').innerHTML =
                                  `<div class="filter-chip ${!filterCategory ? 'active' : ''}" onclick="setFilterCategory(null, this)">Все</div>` +
                                      categories.map(c =>
                                            `<div class="filter-chip ${filterCategory === c.id ? 'active' : ''}" onclick="setFilterCategory(${c.id}, this)">${c.icon} ${c.name}</div>`
                                                ).join('');
                                                }

                                                function setFilterServer(id, el) {
                                                  filterServer = id;
                                                    document.querySelectorAll('#filterServers .filter-chip').forEach(c => c.classList.remove('active'));
                                                      el.classList.add('active');
                                                      }

                                                      function setFilterCategory(id, el) {
                                                        filterCategory = id;
                                                          document.querySelectorAll('#filterCategories .filter-chip').forEach(c => c.classList.remove('active'));
                                                            el.classList.add('active');
                                                            }

                                                            function setSort(sort, el) {
                                                              currentSort = sort;
                                                                document.querySelectorAll('.filters-bar .filter-chip').forEach(c => c.classList.remove('active'));
                                                                  el.classList.add('active');
                                                                    const q = document.getElementById('searchInput').value;
                                                                      if (q) runSearch(q);
                                                                      }
                                                                      function onSearch(value) {
                                                                          const clearBtn = document.getElementById('clearBtn');
                                                                            clearBtn.style.display = value ? 'block' : 'none';
                                                                              clearTimeout(searchTimeout);
                                                                                if (!value.trim()) {
                                                                                    document.getElementById('searchGrid').innerHTML = `
                                                                                          <div class="empty-state" style="grid-column:span 2">
                                                                                                  <div class="empty-icon">🔍</div>
                                                                                                          <p>Введите запрос для поиска</p>
                                                                                                                </div>`;
                                                                                                                    return;
                                                                                                                      }
                                                                                                                        searchTimeout = setTimeout(() => runSearch(value), 400);
                                                                                                                        }

                                                                                                                        function clearSearch() {
                                                                                                                          document.getElementById('searchInput').value = '';
                                                                                                                            document.getElementById('clearBtn').style.display = 'none';
                                                                                                                              document.getElementById('searchGrid').innerHTML = `
                                                                                                                                  <div class="empty-state" style="grid-column:span 2">
                                                                                                                                        <div class="empty-icon">🔍</div>
                                                                                                                                              <p>Введите запрос для поиска</p>
                                                                                                                                                  </div>`;
                                                                                                                                                  }

                                                                                                                                                  async function runSearch(query) {
                                                                                                                                                    const grid = document.getElementById('searchGrid');
                                                                                                                                                      grid.innerHTML = `
                                                                                                                                                          <div class="skeleton-card"><div class="skeleton skeleton-photo"></div></div>
                                                                                                                                                              <div class="skeleton-card"><div class="skeleton skeleton-photo"></div></div>`;

                                                                                                                                                                let listings = await getListings({
                                                                                                                                                                    search: query,
                                                                                                                                                                        serverId: filterServer,
                                                                                                                                                                            categoryId: filterCategory,
                                                                                                                                                                                limit: 40
                                                                                                                                                                                  });

                                                                                                                                                                                    if (filterPriceMin) listings = listings.filter(l => l.price >= filterPriceMin);
                                                                                                                                                                                      if (filterPriceMax) listings = listings.filter(l => l.price <= filterPriceMax);

                                                                                                                                                                                        if (currentSort === 'cheap') listings.sort((a, b) => a.price - b.price);
                                                                                                                                                                                          else if (currentSort === 'expensive') listings.sort((a, b) => b.price - a.price);
                                                                                                                                                                                            else if (currentSort === 'popular') listings.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
                                                                                                                                                                                              else listings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                                                                                                                                                                                                if (!listings.length) {
                                                                                                                                                                                                    grid.innerHTML = `
                                                                                                                                                                                                          <div class="empty-state" style="grid-column:span 2">
                                                                                                                                                                                                                  <div class="empty-icon">📭</div>
                                                                                                                                                                                                                          <p>Ничего не найдено</p>
                                                                                                                                                                                                                                </div>`;
                                                                                                                                                                                                                                    return;
                                                                                                                                                                                                                                      }

                                                                                                                                                                                                                                        grid.innerHTML = listings.map(l => {
                                                                                                                                                                                                                                            const photo = l.listing_photos?.[0]?.url;
                                                                                                                                                                                                                                                const photoEl = photo
                                                                                                                                                                                                                                                      ? `<img src="${photo}" alt="${l.title}">`
                                                                                                                                                                                                                                                            : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:32px">${l.categories?.icon || '📦'}</div>`;
                                                                                                                                                                                                                                                                const price = Number(l.price).toLocaleString('ru-RU');
                                                                                                                                                                                                                                                                    return `
                                                                                                                                                                                                                                                                          <div class="listing-card" onclick="window.location.href='listing.html?id=${l.id}'">
                                                                                                                                                                                                                                                                                  <div class="listing-photo">${photoEl}</div>
                                                                                                                                                                                                                                                                                          <div class="listing-info">
                                                                                                                                                                                                                                                                                                    <div class="listing-price">${price} ₽</div>
                                                                                                                                                                                                                                                                                                              <div class="listing-title">${l.title}</div>
                                                                                                                                                                                                                                                                                                                        <div class="listing-meta">
                                                                                                                                                                                                                                                                                                                                    <span>${l.servers?.name || ''}</span>
                                                                                                                                                                                                                                                                                                                                                <span>·</span>
                                                                                                                                                                                                                                                                                                                                                            <span>👁 ${l.views_count || 0}</span>
                                                                                                                                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                                                                                                                                    </div>`;
                                                                                                                                                                                                                                                                                                                                                                                      }).join('');
                                                                                                                                                                                                                                                                                                                                                                                      }

                                                                                                                                                                                                                                                                                                                                                                                      function openFilters() {
                                                                                                                                                                                                                                                                                                                                                                                        document.getElementById('filtersModal').style.display = 'flex';
                                                                                                                                                                                                                                                                                                                                                                                        }

                                                                                                                                                                                                                                                                                                                                                                                        function closeFilters() {
                                                                                                                                                                                                                                                                                                                                                                                          document.getElementById('filtersModal').style.display = 'none';
                                                                                                                                                                                                                                                                                                                                                                                          }

                                                                                                                                                                                                                                                                                                                                                                                          function applyFilters() {
                                                                                                                                                                                                                                                                                                                                                                                            filterPriceMin = Number(document.getElementById('priceMin').value) || null;
                                                                                                                                                                                                                                                                                                                                                                                              filterPriceMax = Number(document.getElementById('priceMax').value) || null;
                                                                                                                                                                                                                                                                                                                                                                                                closeFilters();
                                                                                                                                                                                                                                                                                                                                                                                                  const q = document.getElementById('searchInput').value;
                                                                                                                                                                                                                                                                                                                                                                                                    if (q) runSearch(q);
                                                                                                                                                                                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                                                                                                                                                                                    function showToast(msg) {
                                                                                                                                                                                                                                                                                                                                                                                                      const t = document.getElementById('toast');
                                                                                                                                                                                                                                                                                                                                                                                                        t.textContent = msg;
                                                                                                                                                                                                                                                                                                                                                                                                          t.classList.add('show');
                                                                                                                                                                                                                                                                                                                                                                                                            setTimeout(() => t.classList.remove('show'), 2500);
                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                      }
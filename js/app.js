let currentUser = null;
let currentServer = null;
let currentCategory = null;
let searchTimeout = null;

window.addEventListener('DOMContentLoaded', async () => {
  Telegram.WebApp.ready();
    Telegram.WebApp.expand();
      const tgUser = Telegram.WebApp.initDataUnsafe?.user || {
          id: 0, first_name: 'Гость', username: 'guest'
            };
              currentUser = await getOrCreateUser(tgUser);
                renderAvatar(tgUser);
                  await Promise.all([loadServers(), loadCategories()]);
                    await loadListings();
                    });

                    function renderAvatar(tgUser) {
                      const el = document.getElementById('userAvatar');
                        if (tgUser.photo_url) {
                            el.innerHTML = `<img src="${tgUser.photo_url}" alt="avatar">`;
                              } else {
                                  el.textContent = (tgUser.first_name || 'G')[0].toUpperCase();
                                    }
                                    }

                                    async function loadServers() {
                                      const servers = await getServers();
                                        const container = document.getElementById('serverList');
                                          const allChip = `<div class="server-chip active" onclick="selectServer(null, this)">Все серверы</div>`;
                                            const chips = servers.map(s =>
                                                `<div class="server-chip" onclick="selectServer(${s.id}, this)">${s.name}</div>`
                                                  ).join('');
                                                    container.innerHTML = allChip + chips;
                                                    }

                                                    function selectServer(id, el) {
                                                      currentServer = id;
                                                        document.querySelectorAll('.server-chip').forEach(c => c.classList.remove('active'));
                                                          el.classList.add('active');
                                                            loadListings();
                                                            }

                                                            async function loadCategories() {
                                                              const cats = await getCategories();
                                                                const container = document.getElementById('categoriesList');
                                                                  container.innerHTML = cats.map(c => `
                                                                      <div class="category-card" onclick="selectCategory(${c.id}, this)">
                                                                            <div class="category-icon">${c.icon}</div>
                                                                                  <div class="category-name">${c.name}</div>
                                                                                      </div>
                                                                                        `).join('');
                                                                                        }

                                                                                        function selectCategory(id, el) {
                                                                                          if (currentCategory === id) {
                                                                                              currentCategory = null;
                                                                                                  document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
                                                                                                    } else {
                                                                                                        currentCategory = id;
                                                                                                            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
                                                                                                                el.classList.add('active');
                                                                                                                  }
                                                                                                                    loadListings();
                                                                                                                    }
                                                                                                                    async function loadListings() {
                                                                                                                          const grid = document.getElementById('listingsGrid');
                                                                                                                            grid.innerHTML = renderSkeletons(6);
                                                                                                                              const search = document.getElementById('searchInput').value;
                                                                                                                                const listings = await getListings({
                                                                                                                                    serverId: currentServer,
                                                                                                                                        categoryId: currentCategory,
                                                                                                                                            search
                                                                                                                                              });
                                                                                                                                                if (!listings.length) {
                                                                                                                                                    grid.innerHTML = `
                                                                                                                                                          <div class="empty-state" style="grid-column:span 2">
                                                                                                                                                                  <div class="empty-icon">📭</div>
                                                                                                                                                                          <p>Объявлений пока нет</p>
                                                                                                                                                                                </div>`;
                                                                                                                                                                                    return;
                                                                                                                                                                                      }
                                                                                                                                                                                        grid.innerHTML = listings.map(renderListingCard).join('');
                                                                                                                                                                                        }

                                                                                                                                                                                        function renderListingCard(l) {
                                                                                                                                                                                          const photo = l.listing_photos?.[0]?.url;
                                                                                                                                                                                            const photoEl = photo
                                                                                                                                                                                                ? `<img src="${photo}" alt="${l.title}">`
                                                                                                                                                                                                    : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:32px">${l.categories?.icon || '📦'}</div>`;
                                                                                                                                                                                                      const scam = l.users?.is_scam
                                                                                                                                                                                                          ? `<div class="scam-badge">⚠️ SCAM</div>` : '';
                                                                                                                                                                                                            const price = Number(l.price).toLocaleString('ru-RU');
                                                                                                                                                                                                              return `
                                                                                                                                                                                                                  <div class="listing-card" onclick="openListing('${l.id}')">
                                                                                                                                                                                                                        <div class="listing-photo">${photoEl}</div>
                                                                                                                                                                                                                              <div class="listing-info">
                                                                                                                                                                                                                                      <div class="listing-price">${price} ₽</div>
                                                                                                                                                                                                                                              <div class="listing-title">${l.title}</div>
                                                                                                                                                                                                                                                      <div class="listing-meta">
                                                                                                                                                                                                                                                                <span>${l.servers?.name || ''}</span>
                                                                                                                                                                                                                                                                          <span>·</span>
                                                                                                                                                                                                                                                                                    <span>👁 ${l.views_count || 0}</span>
                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                    ${scam}
                                                                                                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                                                                                              </div>`;
                                                                                                                                                                                                                                                                                                              }

                                                                                                                                                                                                                                                                                                              function renderSkeletons(n) {
                                                                                                                                                                                                                                                                                                                return Array(n).fill(`
                                                                                                                                                                                                                                                                                                                    <div class="skeleton-card">
                                                                                                                                                                                                                                                                                                                          <div class="skeleton skeleton-photo"></div>
                                                                                                                                                                                                                                                                                                                                <div class="skeleton skeleton-line" style="margin:10px"></div>
                                                                                                                                                                                                                                                                                                                                      <div class="skeleton skeleton-line short" style="margin:10px"></div>
                                                                                                                                                                                                                                                                                                                                          </div>`).join('');
                                                                                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                                                                                          function onSearch(value) {
                                                                                                                                                                                                                                                                                                                                              clearTimeout(searchTimeout);
                                                                                                                                                                                                                                                                                                                                                searchTimeout = setTimeout(() => loadListings(), 400);
                                                                                                                                                                                                                                                                                                                                                }

                                                                                                                                                                                                                                                                                                                                                function goTo(page) {
                                                                                                                                                                                                                                                                                                                                                  const pages = {
                                                                                                                                                                                                                                                                                                                                                      home: 'index.html',
                                                                                                                                                                                                                                                                                                                                                          search: 'pages/search.html',
                                                                                                                                                                                                                                                                                                                                                              create: 'pages/create.html',
                                                                                                                                                                                                                                                                                                                                                                  favorites: 'pages/favorites.html'
                                                                                                                                                                                                                                                                                                                                                                    };
                                                                                                                                                                                                                                                                                                                                                                      if (pages[page]) window.location.href = pages[page];
                                                                                                                                                                                                                                                                                                                                                                      }

                                                                                                                                                                                                                                                                                                                                                                      function openListing(id) {
                                                                                                                                                                                                                                                                                                                                                                        window.location.href = `pages/listing.html?id=${id}`;
                                                                                                                                                                                                                                                                                                                                                                        }

                                                                                                                                                                                                                                                                                                                                                                        function openProfile() {
                                                                                                                                                                                                                                                                                                                                                                          window.location.href = 'pages/profile.html';
                                                                                                                                                                                                                                                                                                                                                                          }

                                                                                                                                                                                                                                                                                                                                                                          function showToast(msg) {
                                                                                                                                                                                                                                                                                                                                                                            const t = document.getElementById('toast');
                                                                                                                                                                                                                                                                                                                                                                              t.textContent = msg;
                                                                                                                                                                                                                                                                                                                                                                                t.classList.add('show');
                                                                                                                                                                                                                                                                                                                                                                                  setTimeout(() => t.classList.remove('show'), 2500);
                                                                                                                                                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                                                                                                                        
                                                                                                                                                                                                                                                                                                                                    
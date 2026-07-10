let currentUser = null;

window.addEventListener('DOMContentLoaded', async () => {
  Telegram.WebApp.ready();
    Telegram.WebApp.expand();

      const tgUser = Telegram.WebApp.initDataUnsafe?.user || {
          id: 0, first_name: 'Гость', username: 'guest'
            };
              currentUser = await getOrCreateUser(tgUser);
                await loadFavorites();
                });

                async function loadFavorites() {
                  const grid = document.getElementById('favGrid');

                    if (!currentUser || currentUser.id === 0) {
                        grid.innerHTML = `
                              <div class="empty-state" style="grid-column:span 2">
                                      <div class="empty-icon">🔒</div>
                                              <p>Войдите через Telegram</p>
                                                    </div>`;
                                                        return;
                                                          }

                                                            const favs = await getFavorites(currentUser.id);

                                                              if (!favs.length) {
                                                                  grid.innerHTML = `
                                                                        <div class="empty-state" style="grid-column:span 2">
                                                                                <div class="empty-icon">❤️</div>
                                                                                        <p>Избранное пусто</p>
                                                                                              </div>`;
                                                                                                  return;
                                                                                                    }

                                                                                                      grid.innerHTML = favs.map(f => {
                                                                                                          const l = f.listings;
                                                                                                              if (!l) return '';
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
                                                                                                                                                                                                                                  <span>${l.categories?.name || ''}</span>
                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                          </div>`;
                                                                                                                                                                                                                                                            }).join('');
                                                                                                                                                                                                                                                            }

                                                                                                                                                                                                                                                            function showToast(msg) {
                                                                                                                                                                                                                                                              const t = document.getElementById('toast');
                                                                                                                                                                                                                                                                t.textContent = msg;
                                                                                                                                                                                                                                                                  t.classList.add('show');
                                                                                                                                                                                                                                                                    setTimeout(() => t.classList.remove('show'), 2500);
                                                                                                                                                                                                                                                                    }
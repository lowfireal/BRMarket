let currentUser = null;
let selectedServer = null;
let selectedCategory = null;
let photos = [];

window.addEventListener('DOMContentLoaded', async () => {
  Telegram.WebApp.ready();
    Telegram.WebApp.expand();

      const tgUser = Telegram.WebApp.initDataUnsafe?.user || {
          id: 0, first_name: 'Гость', username: 'guest'
            };
              currentUser = await getOrCreateUser(tgUser);

                await Promise.all([loadServers(), loadCategories()]);

                  document.getElementById('descInput').addEventListener('input', function() {
                      document.getElementById('descCount').textContent = this.value.length;
                          checkForbidden(this.value);
                            });

                              document.getElementById('titleInput').addEventListener('input', function() {
                                  checkForbidden(this.value);
                                    });
                                    });

                                    async function loadServers() {
                                      const servers = await getServers();
                                        const container = document.getElementById('serverChips');
                                          container.innerHTML = servers.map(s =>
                                              `<div class="select-chip" onclick="selectServer(${s.id}, this)">${s.name}</div>`
                                                ).join('');
                                                }

                                                async function loadCategories() {
                                                  const cats = await getCategories();
                                                    const container = document.getElementById('categoryChips');
                                                      container.innerHTML = cats.map(c =>
                                                          `<div class="category-select-item" onclick="selectCategory(${c.id}, this)">
                                                                <span>${c.icon}</span>
                                                                      <span>${c.name}</span>
                                                                          </div>`
                                                                            ).join('');
                                                                            }

                                                                            function selectServer(id, el) {
                                                                              selectedServer = id;
                                                                                document.querySelectorAll('.select-chip').forEach(c => c.classList.remove('active'));
                                                                                  el.classList.add('active');
                                                                                  }

                                                                                  function selectCategory(id, el) {
                                                                                    selectedCategory = id;
                                                                                      document.querySelectorAll('.category-select-item').forEach(c => c.classList.remove('active'));
                                                                                        el.classList.add('active');
                                                                                        }

                                                                                        function checkForbidden(text) {
                                                                                          const lower = text.toLowerCase();
                                                                                            const warning = document.getElementById('forbiddenWarning');
                                                                                              const warnText = document.getElementById('forbiddenText');

                                                                                                for (const keyword of CONFIG.FORBIDDEN.keywords) {
                                                                                                    if (lower.includes(keyword)) {
                                                                                                          warnText.textContent = `Запрещено: "${keyword}". Такие объявления не публикуются.`;
                                                                                                                warning.style.display = 'block';
                                                                                                                      return;
                                                                                                                          }
                                                                                                                            }
                                                                                                                              warning.style.display = 'none';
                                                                                                                              }

                                                                                                                              function addPhoto() {
                                                                                                                                if (photos.length >= CONFIG.MAX_PHOTOS_PER_LISTING) {
                                                                                                                                    showToast(`Максимум ${CONFIG.MAX_PHOTOS_PER_LISTING} фото`);
                                                                                                                                        return;
                                                                                                                                          }
                                                                                                                                            const input = document.createElement('input');
                                                                                                                                              input.type = 'file';
                                                                                                                                                input.accept = 'image/*';
                                                                                                                                                  input.onchange = (e) => {
                                                                                                                                                      const file = e.target.files[0];
                                                                                                                                                          if (!file) return;
                                                                                                                                                              const reader = new FileReader();
                                                                                                                                                                  reader.onload = (ev) => {
                                                                                                                                                                        photos.push(ev.target.result);
                                                                                                                                                                              renderPhotos();
                                                                                                                                                                                  };
                                                                                                                                                                                      reader.readAsDataURL(file);
                                                                                                                                                                                        };
                                                                                                                                                                                          input.click();
                                                                                                                                                                                          }

                                                                                                                                                                                          function removePhoto(index) {
                                                                                                                                                                                            photos.splice(index, 1);
                                                                                                                                                                                              renderPhotos();
                                                                                                                                                                                              }

                                                                                                                                                                                              function renderPhotos() {
                                                                                                                                                                                                const grid = document.getElementById('photosGrid');
                                                                                                                                                                                                  const previews = photos.map((p, i) => `
                                                                                                                                                                                                      <div class="photo-preview">
                                                                                                                                                                                                            <img src="${p}" alt="фото ${i+1}">
                                                                                                                                                                                                                  <button class="photo-remove" onclick="removePhoto(${i})">✕</button>
                                                                                                                                                                                                                      </div>`).join('');

                                                                                                                                                                                                                        const addBtn = photos.length < CONFIG.MAX_PHOTOS_PER_LISTING
                                                                                                                                                                                                                            ? `<div class="photo-add" onclick="addPhoto()">
                                                                                                                                                                                                                                    <div class="photo-add-icon">📷</div>
                                                                                                                                                                                                                                            <div class="photo-add-text">Добавить</div>
                                                                                                                                                                                                                                                  </div>` : '';

                                                                                                                                                                                                                                                    grid.innerHTML = previews + addBtn;
                                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                                    async function submitListing() {
                                                                                                                                                                                                                                                      const title = document.getElementById('titleInput').value.trim();
                                                                                                                                                                                                                                                        const price = document.getElementById('priceInput').value;
                                                                                                                                                                                                                                                          const description = document.getElementById('descInput').value.trim();

                                                                                                                                                                                                                                                            if (!selectedServer) { showToast('Выберите сервер'); return; }
                                                                                                                                                                                                                                                              if (!selectedCategory) { showToast('Выберите категорию'); return; }
                                                                                                                                                                                                                                                                if (!title) { showToast('Введите название'); return; }
                                                                                                                                                                                                                                                                  if (!price || Number(price) < 0) { showToast('Введите цену'); return; }

                                                                                                                                                                                                                                                                    const btn = document.getElementById('submitBtn');
                                                                                                                                                                                                                                                                      btn.disabled = true;
                                                                                                                                                                                                                                                                        btn.textContent = 'Публикация...';

                                                                                                                                                                                                                                                                          try {
                                                                                                                                                                                                                                                                              const listing = await createListing({
                                                                                                                                                                                                                                                                                    user_id: currentUser.id,
                                                                                                                                                                                                                                                                                          server_id: selectedServer,
                                                                                                                                                                                                                                                                                                category_id: selectedCategory,
                                                                                                                                                                                                                                                                                                      title,
                                                                                                                                                                                                                                                                                                            description,
                                                                                                                                                                                                                                                                                                                  price: Number(price)
                                                                                                                                                                                                                                                                                                                      });

                                                                                                                                                                                                                                                                                                                          showToast('Объявление опубликовано!');
                                                                                                                                                                                                                                                                                                                              setTimeout(() => {
                                                                                                                                                                                                                                                                                                                                    window.location.href = `listing.html?id=${listing.id}`;
                                                                                                                                                                                                                                                                                                                                        }, 1000);
                                                                                                                                                                                                                                                                                                                                          } catch (err) {
                                                                                                                                                                                                                                                                                                                                              showToast(err.message);
                                                                                                                                                                                                                                                                                                                                                  btn.disabled = false;
                                                                                                                                                                                                                                                                                                                                                      btn.textContent = 'Опубликовать объявление';
                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                        }

                                                                                                                                                                                                                                                                                                                                                        function showToast(msg) {
                                                                                                                                                                                                                                                                                                                                                          const t = document.getElementById('toast');
                                                                                                                                                                                                                                                                                                                                                            t.textContent = msg;
                                                                                                                                                                                                                                                                                                                                                              t.classList.add('show');
                                                                                                                                                                                                                                                                                                                                                                setTimeout(() => t.classList.remove('show'), 2500);
                                                                                                                                                                                                                                                                                                                                                                }
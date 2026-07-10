let currentUser = null;

window.addEventListener('DOMContentLoaded', async () => {
  Telegram.WebApp.ready();
    const tgUser = Telegram.WebApp.initDataUnsafe?.user || { id: 0 };
      currentUser = await getOrCreateUser(tgUser);
        await loadCategories();
        });

        async function loadCategories() {
          const { data: cats } = await db
              .from('categories').select('*').order('display_order');
                const container = document.getElementById('categoriesContent');
                  container.innerHTML = (cats || []).map(c => `
                      <div class="admin-card">
                            <div class="admin-card-header">
                                    <div class="admin-card-title">${c.icon} ${c.name}</div>
                                            <span class="status-badge ${c.is_active && !c.is_blocked ? 'status-resolved' : 'status-rejected'}">
                                                      ${c.is_blocked ? 'Заблокирована' : c.is_active ? 'Активна' : 'Скрыта'}
                                                              </span>
                                                                    </div>
                                                                          <div class="admin-card-body">
                                                                                  <div class="btn-row">
                                                                                            <button class="${c.is_active ? 'btn-ban' : 'btn-unban'}"
                                                                                                        onclick="toggleCategory(${c.id}, ${c.is_active})">
                                                                                                                    ${c.is_active ? 'Скрыть' : 'Показать'}
                                                                                                                              </button>
                                                                                                                                        <button class="${c.is_blocked ? 'btn-unban' : 'btn-warn'}"
                                                                                                                                                    onclick="toggleBlock(${c.id}, ${c.is_blocked})">
                                                                                                                                                                ${c.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                                                                                                                                                                          </button>
                                                                                                                                                                                  </div>
                                                                                                                                                                                        </div>
                                                                                                                                                                                            </div>`).join('');
                                                                                                                                                                                            }

                                                                                                                                                                                            async function toggleCategory(id, isActive) {
                                                                                                                                                                                              await db.from('categories').update({ is_active: !isActive }).eq('id', id);
                                                                                                                                                                                                showToast(isActive ? 'Категория скрыта' : 'Категория показана');
                                                                                                                                                                                                  await loadCategories();
                                                                                                                                                                                                  }

                                                                                                                                                                                                  async function toggleBlock(id, isBlocked) {
                                                                                                                                                                                                    await db.from('categories').update({ is_blocked: !isBlocked }).eq('id', id);
                                                                                                                                                                                                      showToast(isBlocked ? 'Категория разблокирована' : 'Категория заблокирована');
                                                                                                                                                                                                        await loadCategories();
                                                                                                                                                                                                        }

                                                                                                                                                                                                        function showToast(msg) {
                                                                                                                                                                                                          const t = document.getElementById('toast');
                                                                                                                                                                                                            t.textContent = msg;
                                                                                                                                                                                                              t.classList.add('show');
                                                                                                                                                                                                                setTimeout(() => t.classList.remove('show'), 2500);
                                                                                                                                                                                                                }
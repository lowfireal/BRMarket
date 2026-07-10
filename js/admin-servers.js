let currentUser = null;

window.addEventListener('DOMContentLoaded', async () => {
  Telegram.WebApp.ready();
    const tgUser = Telegram.WebApp.initDataUnsafe?.user || { id: 0 };
      currentUser = await getOrCreateUser(tgUser);
        await loadServers();
        });

        async function loadServers() {
          const { data: servers } = await db
              .from('servers').select('*').order('display_order');
                const container = document.getElementById('serversList');
                  container.innerHTML = (servers || []).map(s => `
                      <div class="admin-card">
                            <div class="admin-card-header">
                                    <div class="admin-card-title">${s.name}</div>
                                            <span class="status-badge ${s.is_active ? 'status-resolved' : 'status-rejected'}">
                                                      ${s.is_active ? 'Активен' : 'Отключён'}
                                                              </span>
                                                                    </div>
                                                                          <div class="admin-card-body">
                                                                                  <div style="font-size:12px;color:var(--hint);margin-bottom:10px">
                                                                                            slug: ${s.slug} · порядок: ${s.display_order}
                                                                                                    </div>
                                                                                                            <div class="btn-row">
                                                                                                                      <button class="${s.is_active ? 'btn-ban' : 'btn-unban'}"
                                                                                                                                  onclick="toggleServer(${s.id}, ${s.is_active})">
                                                                                                                                              ${s.is_active ? 'Отключить' : 'Включить'}
                                                                                                                                                        </button>
                                                                                                                                                                </div>
                                                                                                                                                                      </div>
                                                                                                                                                                          </div>`).join('');
                                                                                                                                                                          }

                                                                                                                                                                          async function addServer() {
                                                                                                                                                                            const name = document.getElementById('newServerName').value.trim();
                                                                                                                                                                              const slug = document.getElementById('newServerSlug').value.trim().toLowerCase();
                                                                                                                                                                                if (!name || !slug) { showToast('Заполните все поля'); return; }
                                                                                                                                                                                  await db.from('servers').insert({ name, slug });
                                                                                                                                                                                    document.getElementById('newServerName').value = '';
                                                                                                                                                                                      document.getElementById('newServerSlug').value = '';
                                                                                                                                                                                        showToast('Сервер добавлен');
                                                                                                                                                                                          await loadServers();
                                                                                                                                                                                          }

                                                                                                                                                                                          async function toggleServer(id, isActive) {
                                                                                                                                                                                            await db.from('servers').update({ is_active: !isActive }).eq('id', id);
                                                                                                                                                                                              showToast(isActive ? 'Сервер отключён' : 'Сервер включён');
                                                                                                                                                                                                await loadServers();
                                                                                                                                                                                                }

                                                                                                                                                                                                function showToast(msg) {
                                                                                                                                                                                                  const t = document.getElementById('toast');
                                                                                                                                                                                                    t.textContent = msg;
                                                                                                                                                                                                      t.classList.add('show');
                                                                                                                                                                                                        setTimeout(() => t.classList.remove('show'), 2500);
                                                                                                                                                                                                        }
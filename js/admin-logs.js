window.addEventListener('DOMContentLoaded', async () => {
      Telegram.WebApp.ready();
        const tgUser = Telegram.WebApp.initDataUnsafe?.user || { id: 0 };
          const user = await getOrCreateUser(tgUser);
            if (!['owner','admin'].includes(user?.role)) {
                document.getElementById('logsContent').innerHTML =
                      '<div class="access-denied"><div class="empty-icon">🔒</div><p>Нет доступа</p></div>';
                          return;
                            }
                              await loadLogs();
                              });

                              async function loadLogs() {
                                const { data: logs } = await db
                                    .from('action_log')
                                        .select('*, users(username, first_name)')
                                            .order('created_at', { ascending: false })
                                                .limit(100);

                                                  const container = document.getElementById('logsContent');

                                                    if (!logs || !logs.length) {
                                                        container.innerHTML = '<div class="empty-state"><div class="empty-icon">📜</div><p>Журнал пуст</p></div>';
                                                            return;
                                                              }

                                                                container.innerHTML = logs.map(l => {
                                                                    const who = l.users?.username
                                                                          ? `@${l.users.username}` : l.users?.first_name || `ID:${l.user_id}`;
                                                                              const date = new Date(l.created_at).toLocaleString('ru-RU');
                                                                                  return `
                                                                                        <div class="admin-card" style="margin-bottom:8px">
                                                                                                <div class="admin-card-body" style="padding:12px">
                                                                                                          <div style="font-size:13px;font-weight:600;margin-bottom:4px">${l.details || l.action}</div>
                                                                                                                    <div style="font-size:11px;color:var(--hint)">
                                                                                                                                ${who} · ${date}
                                                                                                                                            ${l.target_type ? ` · ${l.target_type}: ${l.target_id}` : ''}
                                                                                                                                                      </div>
                                                                                                                                                              </div>
                                                                                                                                                                    </div>`;
                                                                                                                                                                      }).join('');
                                                                                                                                                                      }

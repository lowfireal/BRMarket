let listingData = null;
let currentUser = null;
let isFavorite = false;
const listingId = new URLSearchParams(window.location.search).get('id');

const REPORT_REASONS = [
  'Ложная информация',
    'Мошенничество',
      'Запрещённый товар',
        'Дубликат объявления',
          'Оскорбления',
            'Другая причина'
            ];

            window.addEventListener('DOMContentLoaded', async () => {
              Telegram.WebApp.ready();
                Telegram.WebApp.expand();

                  const tgUser = Telegram.WebApp.initDataUnsafe?.user || {
                      id: 0, first_name: 'Гость', username: 'guest'
                        };
                          currentUser = await getOrCreateUser(tgUser);

                            if (!listingId) { history.back(); return; }

                              listingData = await getListing(listingId);
                                if (!listingData) { showToast('Объявление не найдено'); history.back(); return; }

                                  renderListing(listingData);
                                    checkFavorite();
                                      document.getElementById('bottomActions').style.display = 'flex';
                                      });

                                      function renderListing(l) {
                                        const photos = l.listing_photos || [];
                                          const photoHtml = photos.length
                                              ? `<img src="${photos[0].url}" alt="${l.title}">
                                                     ${photos.length > 1 ? `<div class="photo-counter">1 / ${photos.length}</div>` : ''}`
                                                         : `<div class="photo-placeholder">${l.categories?.icon || '📦'}</div>`;

                                                           const price = Number(l.price).toLocaleString('ru-RU');
                                                             const date = new Date(l.created_at).toLocaleDateString('ru-RU');
                                                               const seller = l.users;
                                                                 const sellerName = seller?.username
                                                                     ? `@${seller.username}`
                                                                         : seller?.first_name || 'Пользователь';

                                                                           const avatarHtml = seller?.avatar_url
                                                                               ? `<img src="${seller.avatar_url}" alt="avatar">`
                                                                                   : (seller?.first_name || 'U')[0].toUpperCase();

                                                                                     const scam = seller?.is_scam
                                                                                         ? `<div class="scam-badge" style="margin-top:4px">⚠️ Подозрение на мошенничество</div>` : '';

                                                                                           document.getElementById('listingContent').innerHTML = `
                                                                                               <div class="photo-slider">${photoHtml}</div>
                                                                                                   <div class="listing-detail">
                                                                                                         <div class="detail-price">${price} ₽</div>
                                                                                                               <div class="detail-title">${l.title}</div>
                                                                                                                     <div class="detail-tags">
                                                                                                                             <span class="tag">📡 ${l.servers?.name || ''}</span>
                                                                                                                                     <span class="tag">${l.categories?.icon || ''} ${l.categories?.name || ''}</span>
                                                                                                                                           </div>
                                                                                                                                                 <div class="detail-section">
                                                                                                                                                         <div class="detail-section-title">Описание</div>
                                                                                                                                                                 <div class="detail-description">${l.description || 'Описание не указано'}</div>
                                                                                                                                                                       </div>
                                                                                                                                                                             <div class="seller-card">
                                                                                                                                                                                     <div class="seller-avatar">${avatarHtml}</div>
                                                                                                                                                                                             <div>
                                                                                                                                                                                                       <div class="seller-name">${sellerName}</div>
                                                                                                                                                                                                                 <div class="seller-rating">★ ${seller?.rating || '0.0'}</div>
                                                                                                                                                                                                                           <div class="seller-stats">Сделок: ${seller?.deals_count || 0}</div>
                                                                                                                                                                                                                                     ${scam}
                                                                                                                                                                                                                                             </div>
                                                                                                                                                                                                                                                   </div>
                                                                                                                                                                                                                                                         <div class="detail-meta">
                                                                                                                                                                                                                                                                 <span>📅 ${date}</span>
                                                                                                                                                                                                                                                                         <span>👁 ${l.views_count || 0} просмотров</span>
                                                                                                                                                                                                                                                                               </div>
                                                                                                                                                                                                                                                                                   </div>`;
                                                                                                                                                                                                                                                                                   }

                                                                                                                                                                                                                                                                                   async function checkFavorite() {
                                                                                                                                                                                                                                                                                     if (!currentUser || currentUser.id === 0) return;
                                                                                                                                                                                                                                                                                       const favs = await getFavorites(currentUser.id);
                                                                                                                                                                                                                                                                                         isFavorite = favs.some(f => f.listing_id === listingId);
                                                                                                                                                                                                                                                                                           updateFavBtn();
                                                                                                                                                                                                                                                                                           }

                                                                                                                                                                                                                                                                                           function updateFavBtn() {
                                                                                                                                                                                                                                                                                             const btn = document.getElementById('favBtn');
                                                                                                                                                                                                                                                                                               btn.classList.toggle('active', isFavorite);
                                                                                                                                                                                                                                                                                                 btn.textContent = isFavorite ? '❤️' : '🤍';
                                                                                                                                                                                                                                                                                                 }

                                                                                                                                                                                                                                                                                                 async function toggleFav() {
                                                                                                                                                                                                                                                                                                   if (!currentUser || currentUser.id === 0) { showToast('Войдите через Telegram'); return; }
                                                                                                                                                                                                                                                                                                     isFavorite = await toggleFavorite(currentUser.id, listingId);
                                                                                                                                                                                                                                                                                                       updateFavBtn();
                                                                                                                                                                                                                                                                                                         showToast(isFavorite ? 'Добавлено в избранное' : 'Удалено из избранного');
                                                                                                                                                                                                                                                                                                         }

                                                                                                                                                                                                                                                                                                         function writeSeller() {
                                                                                                                                                                                                                                                                                                           if (!listingData?.users?.username) { showToast('У продавца нет username'); return; }
                                                                                                                                                                                                                                                                                                             Telegram.WebApp.openTelegramLink(`https://t.me/${listingData.users.username}`);
                                                                                                                                                                                                                                                                                                             }

                                                                                                                                                                                                                                                                                                             function shareListing() {
                                                                                                                                                                                                                                                                                                               const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}`;
                                                                                                                                                                                                                                                                                                                 Telegram.WebApp.openTelegramLink(url);
                                                                                                                                                                                                                                                                                                                 }

                                                                                                                                                                                                                                                                                                                 function openReport() {
                                                                                                                                                                                                                                                                                                                   const opts = document.getElementById('reportOptions');
                                                                                                                                                                                                                                                                                                                     opts.innerHTML = REPORT_REASONS.map(r =>
                                                                                                                                                                                                                                                                                                                         `<div class="report-option" onclick="sendReport('${r}')">${r}</div>`
                                                                                                                                                                                                                                                                                                                           ).join('');
                                                                                                                                                                                                                                                                                                                             document.getElementById('reportModal').style.display = 'flex';
                                                                                                                                                                                                                                                                                                                             }

                                                                                                                                                                                                                                                                                                                             function closeReport() {
                                                                                                                                                                                                                                                                                                                               document.getElementById('reportModal').style.display = 'none';
                                                                                                                                                                                                                                                                                                                               }

                                                                                                                                                                                                                                                                                                                               async function sendReport(reason) {
                                                                                                                                                                                                                                                                                                                                 closeReport();
                                                                                                                                                                                                                                                                                                                                   if (!currentUser || currentUser.id === 0) { showToast('Войдите через Telegram'); return; }
                                                                                                                                                                                                                                                                                                                                     await createReport({
                                                                                                                                                                                                                                                                                                                                         listing_id: listingId,
                                                                                                                                                                                                                                                                                                                                             reporter_id: currentUser.id,
                                                                                                                                                                                                                                                                                                                                                 reason,
                                                                                                                                                                                                                                                                                                                                                     status: 'pending'
                                                                                                                                                                                                                                                                                                                                                       });
                                                                                                                                                                                                                                                                                                                                                         showToast('Жалоба отправлена');
                                                                                                                                                                                                                                                                                                                                                         }

                                                                                                                                                                                                                                                                                                                                                         function showToast(msg) {
                                                                                                                                                                                                                                                                                                                                                           const t = document.getElementById('toast');
                                                                                                                                                                                                                                                                                                                                                             t.textContent = msg;
                                                                                                                                                                                                                                                                                                                                                               t.classList.add('show');
                                                                                                                                                                                                                                                                                                                                                                 setTimeout(() => t.classList.remove('show'), 2500);
                                                                                                                                                                                                                                                                                                                                                                 }
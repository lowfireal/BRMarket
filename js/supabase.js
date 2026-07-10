const { createClient } = supabase;
const db = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

async function getOrCreateUser(telegramUser) {
  if (!telegramUser) return null;
    const { data: existing } = await db
        .from('users').select('*')
            .eq('id', telegramUser.id).single();

              if (existing) {
                  await db.from('users').update({
                        last_seen: new Date().toISOString(),
                              username: telegramUser.username,
                                    first_name: telegramUser.first_name,
                                          last_name: telegramUser.last_name
                                              }).eq('id', telegramUser.id);
                                                  return existing;
                                                    }

                                                      const { data: newUser } = await db.from('users').insert({
                                                          id: telegramUser.id,
                                                              username: telegramUser.username,
                                                                  first_name: telegramUser.first_name,
                                                                      last_name: telegramUser.last_name,
                                                                          role: 'user'
                                                                            }).select().single();
                                                                              return newUser;
                                                                              }

                                                                            async function getServers() {
                                                                                const { data } = await db
                                                                                    .from('servers').select('*')
                                                                                        .eq('is_active', true)
                                                                                            .order('display_order');
                                                                                              return data || [];
                                                                                              }

                                                                                              async function getCategories() {
                                                                                                const { data } = await db
                                                                                                    .from('categories').select('*')
                                                                                                        .eq('is_active', true)
                                                                                                            .eq('is_blocked', false)
                                                                                                                .order('display_order');
                                                                                                                  return data || [];
                                                                                                                  }


                                                                                                                  async function getListings({ serverId = null, categoryId = null, search = '', limit = 20, offset = 0 } = {}) {
                                                                                                                      let query = db
                                                                                                                          .from('listings')
                                                                                                                              .select(`
                                                                                                                                    *,
                                                                                                                                          users(id,username,first_name,avatar_url,is_scam,rating),
                                                                                                                                                servers(id,name,slug),
                                                                                                                                                      categories(id,name,slug,icon),
                                                                                                                                                            listing_photos(url,display_order)
                                                                                                                                                                `)
                                                                                                                                                                    .eq('status', 'active')
                                                                                                                                                                        .gt('expires_at', new Date().toISOString())
                                                                                                                                                                            .order('created_at', { ascending: false })
                                                                                                                                                                                .range(offset, offset + limit - 1);

                                                                                                                                                                                  if (serverId) query = query.eq('server_id', serverId);
                                                                                                                                                                                    if (categoryId) query = query.eq('category_id', categoryId);
                                                                                                                                                                                      if (search) query = query.ilike('title', `%${search}%`);

                                                                                                                                                                                        const { data } = await query;
                                                                                                                                                                                          return data || [];
                                                                                                                                                                                          }

                                                                                                                                                                                          async function getListing(id) {
                                                                                                                                                                                            const { data } = await db
                                                                                                                                                                                                .from('listings')
                                                                                                                                                                                                    .select(`
                                                                                                                                                                                                          *,
                                                                                                                                                                                                                users(id,username,first_name,avatar_url,is_scam,rating,deals_count),
                                                                                                                                                                                                                      servers(id,name,slug),
                                                                                                                                                                                                                            categories(id,name,slug,icon),
                                                                                                                                                                                                                                  listing_photos(url,display_order)
                                                                                                                                                                                                                                      `)
                                                                                                                                                                                                                                          .eq('id', id).single();

                                                                                                                                                                                                                                            if (data) {
                                                                                                                                                                                                                                                await db.from('listings')
                                                                                                                                                                                                                                                      .update({ views_count: (data.views_count || 0) + 1 })
                                                                                                                                                                                                                                                            .eq('id', id);
                                                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                                                return data;
                                                                                                                                                                                                                                                                }

                                                                                                                                                                                                                                                                async function createListing(listingData) {
                                                                                                                                                                                                                                                                  const titleLower = listingData.title.toLowerCase();
                                                                                                                                                                                                                                                                    const descLower = (listingData.description || '').toLowerCase();

                                                                                                                                                                                                                                                                      for (const keyword of CONFIG.FORBIDDEN.keywords) {
                                                                                                                                                                                                                                                                          if (titleLower.includes(keyword) || descLower.includes(keyword)) {
                                                                                                                                                                                                                                                                                throw new Error(`Запрещённый контент: "${keyword}". ${CONFIG.FORBIDDEN.reasons.currency}`);
                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                      }

                                                                                                                                                                                                                                                                                        const expiresAt = new Date();
                                                                                                                                                                                                                                                                                          expiresAt.setHours(expiresAt.getHours() + CONFIG.LISTING_LIFETIME_HOURS);

                                                                                                                                                                                                                                                                                            const { data, error } = await db.from('listings').insert({
                                                                                                                                                                                                                                                                                                ...listingData,
                                                                                                                                                                                                                                                                                                    expires_at: expiresAt.toISOString(),
                                                                                                                                                                                                                                                                                                        status: 'active'
                                                                                                                                                                                                                                                                                                          }).select().single();

                                                                                                                                                                                                                                                                                                            if (error) throw new Error(error.message);
                                                                                                                                                                                                                                                                                                              return data;
                                                                                                                                                                                                                                                                                                              }


async function getUserListings(userId) {
  const { data } = await db
      .from('listings')
          .select(`
                *,
                      servers(id,name,slug),
                            categories(id,name,slug,icon),
                                  listing_photos(url,display_order)
                                      `)
                                          .eq('user_id', userId)
                                              .order('created_at', { ascending: false });
                                                return data || [];
                                                }

                                                async function deleteListing(id) {
                                                  const { error } = await db
                                                      .from('listings').delete().eq('id', id);
                                                        if (error) throw new Error(error.message);
                                                        }

                                                        async function extendListing(id) {
                                                          const expiresAt = new Date();
                                                            expiresAt.setHours(expiresAt.getHours() + CONFIG.LISTING_LIFETIME_HOURS);
                                                              const { error } = await db
                                                                  .from('listings')
                                                                      .update({ expires_at: expiresAt.toISOString() })
                                                                          .eq('id', id);
                                                                            if (error) throw new Error(error.message);
                                                                            }

                                                                            async function toggleFavorite(userId, listingId) {
                                                                              const { data: existing } = await db
                                                                                  .from('favorites')
                                                                                      .select('id')
                                                                                          .eq('user_id', userId)
                                                                                              .eq('listing_id', listingId)
                                                                                                  .single();

                                                                                                    if (existing) {
                                                                                                        await db.from('favorites').delete().eq('id', existing.id);
                                                                                                            return false;
                                                                                                              } else {
                                                                                                                  await db.from('favorites').insert({ user_id: userId, listing_id: listingId });
                                                                                                                      return true;
                                                                                                                        }
                                                                                                                        }

                                                                                                                        async function getFavorites(userId) {
                                                                                                                          const { data } = await db
                                                                                                                              .from('favorites')
                                                                                                                                  .select(`
                                                                                                                                        listing_id,
                                                                                                                                              listings(*, servers(name), categories(name,icon), listing_photos(url))
                                                                                                                                                  `)
                                                                                                                                                      .eq('user_id', userId);
                                                                                                                                                        return data || [];
                                                                                                                                                        }

                                                                                                                                                        async function createReport(reportData) {
                                                                                                                                                          const { error } = await db.from('reports').insert(reportData);
                                                                                                                                                            if (error) throw new Error(error.message);
                                                                                                                                                            }
                                                                                                                  
const CONFIG = {
      SUPABASE_URL: 'https://afubmdlchpjlyddsklwl.supabase.co',
        SUPABASE_KEY: 'sb_publishable_bct4Ni4DieUZGTs0BPWt4w_pE0nW8wg',
          APP_NAME: 'BR Market',
            LISTING_LIFETIME_HOURS: 6,
              MAX_LISTINGS_PER_USER: 10,
                MAX_PHOTOS_PER_LISTING: 5,
                  SCAM_THRESHOLD: 5,

                    FORBIDDEN: {
                        keywords: [
                              'вирты', 'виртуальная валюта', 'игровые деньги',
                                    'аккаунт', 'акк', 'аккаунты', 'продам акк'
                                        ],
                                            reasons: {
                                                  currency: 'Продажа игровой валюты (виртов) запрещена правилами Black Russia.',
                                                        accounts: 'Продажа аккаунтов запрещена правилами Black Russia.'
                                                            }
                                                              },

                                                                ROLES: {
                                                                    USER: 'user',
                                                                        MODERATOR: 'moderator',
                                                                            SENIOR_MODERATOR: 'senior_moderator',
                                                                                ARBITRATOR: 'arbitrator',
                                                                                    ADMIN: 'admin',
                                                                                        OWNER: 'owner'
                                                                                          }
                                                                                          };
}
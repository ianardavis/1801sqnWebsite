function checkSession() {
    get({
        table: 'sessions',
        query: ['status=1']
    })
    .then(function ([sessions, options]) {
        if (sessions.length !== 1) {
            add_class({id: 'crd_card_pos', class: 'hidden'});
            remove_attribute({id: 'card_pos_a', attribute: 'href'});
        } else {
            remove_class({id: 'crd_card_pos', class: 'hidden'});
            set_href({id: 'card_pos_a', value: '/canteen/pos'});
        };
    });
};
addReloadListener(checkSession);
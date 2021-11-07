function checkSession() {
    get({
        table: 'sessions',
        query: ['"status":1']
    })
    .then(function ([sessions, options]) {
        if (sessions.length !== 1) {
            add_class({id: 'crd_card_pos', class: 'hidden'});
            remove_attribute({id: 'a_card_pos', attribute: 'href'});
        } else {
            remove_class({id: 'crd_card_pos', class: 'hidden'});
            set_href({id: 'a_card_pos', value: '/pos'});
        };
    });
};
addReloadListener(checkSession);
function checkSession() {
    get({
        table: 'sessions',
        query: ['"status":1']
    })
    .then(function ([sessions, options]) {
        if (sessions.length !== 1) {
            hide('crd_card_pos');
            set_href({id: 'a_card_pos'});
        } else {
            show('crd_card_pos');
            set_href('a_card_pos', '/pos');
        };
    });
};
addReloadListener(checkSession);
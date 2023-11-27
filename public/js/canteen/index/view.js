function checkSession() {
    get({
        table: 'sessions',
        where: {status: 1}
    })
    .then(function ([results, options]) {
        if (results.sessions.length !== 1) {
            hide('crd_card_pos');
            setHREF('a_card_pos');
        } else {
            show('crd_card_pos');
            setHREF('a_card_pos', '/pos');
        };
    });
};
window.addEventListener('load', function () {
    add_listener('reload', checkSession);
});
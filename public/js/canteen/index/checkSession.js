function checkSession() {
    get(
        {
            table: 'sessions',
            query: ['_status=1']
        },
        function (sessions, options) {
            if (sessions.length !== 1) {
                add_class({id: 'card_pos', class: 'hidden'});
                remove_attribute({id: 'card_pos_a', attribute: 'href'});
            } else {
                remove_class({id: 'card_pos', class: 'hidden'});
                set_attribute({id: 'card_pos_a', attribute: 'href', value: '/canteen/pos'});
            };
        }
    );
};
document.querySelector('#reload').addEventListener('click', checkSession);
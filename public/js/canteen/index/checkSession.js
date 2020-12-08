function checkSession() {
    get(
        function (sessions, options) {
            let card = document.querySelector('#card_pos'),
                a    = document.querySelector('#card_pos_a');
            if (sessions.length !== 1) {
                card.classList.add('hidden');
                a.removeAttribute('href');
            } else {
                card.classList.remove('hidden');
                a.setAttribute('href', '/canteen/pos');
            };
        },
        {
            db:    'canteen',
            table: 'sessions',
            query: ['_status=1']
        }
    );
};
document.querySelector('#reload').addEventListener('click', checkSession);
function getSession(sessions, options) {
    let card = document.querySelector('#card_pos'),
        a    = document.querySelector('#card_pos_a');
    if (sessions.length !== 1) {
        // alert(`${sessions.length} open sessions found\nTo run canteen you must only have 1 session open`);
        card.classList.add('hidden');
        a.removeAttribute('href');
    } else {
        card.classList.remove('hidden');
        a.setAttribute('href', '/canteen/pos');
    };
};
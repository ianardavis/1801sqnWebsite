function getMovement() {
    get({
        table: 'movement',
        query: [`"movement_id":"${path[2]}"`]
    })
    .then(function ([movement, options]) {
        set_breadcrumb(movement.description);
        set_innerText('movement_description', movement.description);
        set_innerText('movement_type',        movement.type);
        set_innerText('movement_amount',      movement.amount);
        set_innerText('movement_from',        (movement.session ? 'Canteen Session' : (movement.holding_from ? movement.holding_from.description : 'Unknown')));
        set_innerText('movement_to',          movement.holding_to.description);
        set_innerText('movement_user',        print_user(movement.user));
        set_innerText('movement_createdAt',   print_date(movement.createdAt, true));
        set_href('movement_from_link', (movement.session ? `/sessions/${movement.session_id}` : (movement.holding_from ? `/holdings/${movement.holding_from.holding_id}` : '')));
        set_href('movement_to_link',   `/holdings/${movement.holding_id_to}`);
        set_href('movement_user_link', `/users/${movement.user_id}`);
    });
};
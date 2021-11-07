function getMovement() {
    get({
        table: 'movement',
        query: [`"movement_id":"${path[2]}"`]
    })
    .then(function ([movement, options]) {
        set_breadcrumb({text: movement.description});
        set_innerText({id: 'movement_description', value: movement.description});
        set_innerText({id: 'movement_type',        value: movement.type});
        set_innerText({id: 'movement_amount',      value: movement.amount});
        set_innerText({id: 'movement_from',        value: (movement.session ? 'Canteen Session' : (movement.holding_from ? movement.holding_from.description : 'Unknown'))});
        set_innerText({id: 'movement_to',          value: movement.holding_to.description});
        set_innerText({id: 'movement_user',        value: print_user(movement.user)});
        set_innerText({id: 'movement_createdAt',   value: print_date(movement.createdAt, true)});
        set_href({id: 'movement_from_link', value: (movement.session ? `/sessions/${movement.session_id}` : (movement.holding_from ? `/holdings/${movement.holding_from.holding_id}` : ''))});
        set_href({id: 'movement_to_link',   value: `/holdings/${movement.holding_id_to}`});
        set_href({id: 'movement_user_link', value: `/users/${movement.user_id}`});
    });
};
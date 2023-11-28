function getMovement() {
    get({
        table: 'movement',
        where: {movement_id: path[2]}
    })
    .then(function ([movement, options]) {
        setBreadcrumb(movement.description);
        setInnerText('movement_description', movement.description);
        setInnerText('movement_type',        movement.type);
        setInnerText('movement_amount',      movement.amount);
        setInnerText('movement_from',        (movement.session ? 'Canteen Session' : (movement.holding_from ? movement.holding_from.description : 'Unknown')));
        setInnerText('movement_to',          movement.holding_to.description);
        setInnerText('movement_user',        printUser(movement.user));
        setInnerText('movement_createdAt',   printDate(movement.createdAt, true));
        setHREF('movement_from_link', (movement.session ? `/sessions/${movement.session_id}` : (movement.holding_from ? `/holdings/${movement.holding_from.holding_id}` : '')));
        setHREF('movement_to_link',   `/holdings/${movement.holding_id_to}`);
        setHREF('movement_user_link', `/users/${movement.user_id}`);
    });
};
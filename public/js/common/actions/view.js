function getActions() {
    clear_table('actions')
    .then(tbl_actions => {
        get({
            table: 'actions',
            query: [`_table=${path[1]}`, `id=${path[2]}`]
        })
        .then(function ([actions, options]) {
            set_count({id: 'action', count: actions.length || '0'});
            actions.forEach(action => {
                let row = tbl_actions.insertRow(-1);
                add_cell(row, table_date(action.createdAt));
                add_cell(row, {text: action.action});
                add_cell(row, {append: new Button({
                    modal: 'action_view',
                    small: true,
                    data: [{field: 'id', value: action.action_id}]
                }).e})
            })
        });
    });
};

function viewLine(action_id) {
    get({
        table: 'action',
        query: [`action_id=${action_id}`]
    })
    .then(function ([action, options]) {
        set_innerText({id: 'action_id',        text: action.action_id});
        set_innerText({id: 'action_action',    text: action.action});
        set_innerText({id: 'action_user',      text: print_user(action.user)});
        set_innerText({id: 'action_createdAt', text: print_date(action.createdAt, true)});
        set_href({id: 'action_user_link', value: `/users/${action.user_id}`});
        clear_table('links')
        .then(tbl_links => {
            get({
                table: 'action_links',
                query: [`action_id=${action.action_id}`]
            })
            .then(function ([links, options]) {
                links.forEach(link => {
                    let row = tbl_links.insertRow(-1);
                    add_cell(row, {text: link._table});
                    add_cell(row, {append: new Link({
                        href: `/${link._table}/${link.id}`,
                        small: true
                    }).e})
                });
            });
        });
    });
};
window.addEventListener('load', function () {
    modalOnShow('action_view', function (event) {viewLine(event.relatedTarget.dataset.id)});
});
function getActions() {
    clear('tbl_actions')
    .then(tbl_actions => {
        let sort_cols = tbl_actions.parentNode.querySelector('.sort') || null;
        get({
            table: 'actions',
            query: [`"_table":"${path[1]}"`, `"id":"${path[2]}"`],
            ...sort_query(sort_cols)
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
function getLinks(action_id) {
    clear('tbl_links')
    .then(tbl_links => {
        get({
            table: 'action_links',
            query: [`"action_id":"${action_id}"`]
        })
        .then(function ([links, options]) {
            links.forEach(link => {
                let row = tbl_links.insertRow(-1);
                add_cell(row, {text: link._table});
                add_cell(row, (
                    link._table === path[1] && link.id === path[2] ?
                    {text: 'This record'} : 
                    {append: new Link({
                        href: `/${link._table}/${link.id}`,
                        small: true
                    }).e}
                ));
            });
        });
    });
};
function viewLine(action_id) {
    get({
        table: 'action',
        query: [`"action_id":"${action_id}"`]
    })
    .then(function ([action, options]) {
        set_innerText({id: 'action_id',        text: action.action_id});
        set_innerText({id: 'action_action',    text: action.action});
        set_innerText({id: 'action_user',      text: print_user(action.user)});
        set_innerText({id: 'action_createdAt', text: print_date(action.createdAt, true)});
        set_href({id: 'action_user_link', value: `/users/${action.user_id}`});
    });
};
addReloadListener(getActions);
window.addEventListener('load', function () {
    modalOnShow('action_view', function (event) {viewLine(event.relatedTarget.dataset.id)});
    modalOnShow('action_view', function (event) {getLinks(event.relatedTarget.dataset.id)});
});
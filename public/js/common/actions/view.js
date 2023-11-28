function getActions() {
    clear('tbl_actions')
    .then(tbl_actions => {
        get({
            table: 'actions',
            where: {
                _table: path[1],
                id:     path[2]
            },
            func: getActions
        })
        .then(function ([result, options]) {
            setCount('action', result.count);
            result.actions.forEach(action => {
                let row = tbl_actions.insertRow(-1);
                addCell(row, tableDate(action.createdAt, true));
                addCell(row, {text: action.action, classes: ['text-start']});
                addCell(row, {append: new Modal_Button(
                    _search(),
                    'action_view',
                    [{field: 'id', value: action.action_id}]
                ).e})
            })
        });
    });
};
function getLinks(action_id) {
    clear('tbl_links')
    .then(tbl_links => {
        get({
            table: 'action_links',
            where: {action_id: action_id}
        })
        .then(function ([links, options]) {
            links.forEach(link => {
                let row = tbl_links.insertRow(-1);
                addCell(row, {text: link._table});
                addCell(row, {html: (link.active ? _check() : '')});
                addCell(row, (
                    link._table === path[1] && link.id === path[2] ?
                    {text: 'This record'} : 
                    {append: new Link(`/${link._table}/${link.id}`).e}
                ));
            });
        });
    });
};
function viewLine(action_id) {
    get({
        table: 'action',
        where: {action_id: action_id}
    })
    .then(function ([action, options]) {
        setInnerText('action_id',        action.action_id);
        setInnerText('action_action',    action.action);
        setInnerText('action_user',      printUser(action.user));
        setInnerText('action_createdAt', printDate(action.createdAt, true));
        setHREF('action_user_link', `/users/${action.user_id}`);
    });
};
window.addEventListener('load', function () {
    addListener('reload', getActions);
    modalOnShow('action_view', function (event) {viewLine(event.relatedTarget.dataset.id)});
    modalOnShow('action_view', function (event) {getLinks(event.relatedTarget.dataset.id)});
    addSortListeners('actions', getActions);
    getActions();
});
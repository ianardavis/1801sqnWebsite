function getActions() {
    clear_table('actions')
    .then(tbl_actions => {
        get({
            table: 'actions',
            query: [`issue_id=${path[2]}`]
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
                }).e});
            });
        })
    });
};
function viewAction(action_id) {
    get({
        table: 'action',
        query: [`action_id=${action_id}`]
    })
    .then(function ([action, options]) {
        console.log(action)
        set_innerText({id: 'action_id',            value: action.action_id});
        set_innerText({id: 'action_action',        value: action.action});
        set_innerText({id: 'action_createdAt',     value: print_date(action.createdAt, true)});
        set_innerText({id: 'action_user',          value: (action.user          ? print_user(action.user)  : '')});
        set_innerText({id: 'action_location',      value: (action.location      ? action.location.location : '')});
        set_innerText({id: 'action_serial',        value: (action.serial        ? action.serial.serial     : '')});
        set_innerText({id: 'action_nsn',           value: (action.nsn           ? print_nsn(action.nsn)    : '')});
        set_innerText({id: 'action_order',         value: (action.order         ? action.order_id          : '')});
        set_innerText({id: 'action_loancard',      value: (action.loancard      ? action.loancard_id       : (action.loancard_line ? action.loancard_id : ''))});
        set_innerText({id: 'action_loancard_line', value: (action.loancard_line ? action.loancard_line_id  : '')});
        set_innerText({id: 'action_demand',        value: (action.demand        ? action.demand_id         : '')});
        set_innerText({id: 'action_demand_line',   value: (action.demand_line   ? action.demand_line_id    : '')});
        set_href({id: 'action_user_link',          value: (action.user          ? `/users/${action.user_id}`                : '')});
        set_href({id: 'action_location_link',      value: (action.location      ? `/locations/${action.location_id}`        : '')});
        set_href({id: 'action_serial_link',        value: (action.serial        ? `/serials/${action.serial_id}`            : '')});
        set_href({id: 'action_nsn_link',           value: (action.nsn           ? `/nsns/${action.nsn_id}`                  : '')});
        set_href({id: 'action_issue_link',         value: (action.issue         ? `/issues/${action.issue_id}`              : '')});
        set_href({id: 'action_loancard_link',      value: (action.loancard      ? `/loancards/${action.loancard_id}`        : (action.loancard_line ? `/loancards/${action.loancard_line.loancard_id}` : ''))});
        set_href({id: 'action_loancard_line_link', value: (action.loancard_line ? `/loancard_lines/${action.loancard_line.loancard_line_id}` : '')});
        set_href({id: 'action_demand_link',        value: (action.demand        ? `/demands/${action.demand_id}`            : '')});
        set_href({id: 'action_demand_line_link',   value: (action.demand_line   ? `/demands/${action.demand_line.demand_id}`: '')});
    });
};
addReloadListener(getActions);
window.addEventListener('load', function () {
    modalOnShow('action_view', function (event) {viewAction(event.relatedTarget.dataset.id)})
});
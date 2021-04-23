function getActions() {
    clear_table('actions')
    .then(tbl_actions => {
        get({
            table: 'actions',
            query: [`serial_id=${path[2]}`]
        })
        .then(function ([actions, options]) {
            set_count({id: 'action', count: actions.length || '0'});
            actions.forEach(action => {
                let row = tbl_actions.insertRow(-1);
                add_cell(row, table_date(action.createdAt));
                add_cell(row, {text: action.action});
                add_cell(row, {append: new Button({
                    modal: 'action_view',
                    data: {field: 'id', value: action.action_id},
                    small: true
                }).e});
            })
        })
    })
};
function viewAction(action_id) {
    get({
        table: 'action',
        query: [`action_id=${action_id}`]
    })
    .then(function ([action, options]) {
        set_innerText({id: 'action_createdAt', text: print_date(action.createdAt, true)});
        set_innerText({id: 'action_action',    text: action.action});
        set_innerText({id: 'action_issue',     text: action.issue_id});
        set_innerText({id: 'action_order',     text: action.order_id});
        set_innerText({id: 'action_stock',     text: (action.stock         ? action.stock.location.location   : '')});
        set_innerText({id: 'action_location',  text: (action.location      ? action.location.location         : '')});
        set_innerText({id: 'action_nsn',       text: (action.nsn           ? print_nsn(action.nsn)            : '')});
        set_innerText({id: 'action_loancard',  text: (action.loancard_line ? action.loancard_line.loancard_id : '')});
        set_innerText({id: 'action_demand',    text: (action.demand_line   ? action.demand_line.demand_id     : '')});
        set_innerText({id: 'action_user',      text: print_user(action.user)});
        set_innerText({id: 'action_id',        text: action.action_id});
        set_href({id: 'action_issue_link',    value: (action.issue_id      ? `/issues/${action.issue_id}`                     : '')});
        set_href({id: 'action_order_link',    value: (action.order_id      ? `/orders/${action.order_id}`                     : '')});
        set_href({id: 'action_stock_link',    value: (action.stock_id      ? `/stocks/${action.stock_id}`                     : '')});
        set_href({id: 'action_location_link', value: (action.location_id   ? `/locations/${action.location_id}`               : '')});
        set_href({id: 'action_nsn_link',      value: (action.nsn_id        ? `/nsns/${action.nsn_id}`                         : '')});
        set_href({id: 'action_loancard_link', value: (action.loancard_line ? `/loancards/${action.loancard_line.loancard_id}` : '')});
        set_href({id: 'action_demand_link',   value: (action.demand_line   ? `/demands/${action.demand_line.demand_id}`       : '')});
        set_href({id: 'action_user_link',     value: `/users/${action.user_id}`});
    })
};
window.addEventListener('load', function () {
    $('#mdl_action_view').on('show.bs.modal', function (event) {viewAction(event.relatedTarget.dataset.id)});
});
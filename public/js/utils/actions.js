let table = '';
if      (path[2] === 'orders') table = 'order'
else if (path[2] === 'issues') table = 'issue';
function showActions() {
    get(
        {
            table: 'actions',
            query: [`${table}_id=${path[3]}`]
        },
        function (actions, options) {
            set_count({id: 'action', count: actions.length || '0'});
            let table_body = document.querySelector('#tbl_actions');
            if (table_body) {
                table_body.innerHTML = '';
                actions.forEach(action => {
                    try {
                        let row = table_body.insertRow(-1);
                        add_cell(row, table_date(action.createdAt));
                        add_cell(row, {text: action._action});
                        add_cell(row, {append: 
                            new Link({
                                small: true,
                                modal: 'action_view',
                                data: {
                                    field: `action_id`,
                                    value: action.action_id
                                }
                            }).e
                        });
                    } catch (error) {
                        console.log(`Error loading action ${action.action_id}:`)
                        console.log(error);
                    };
                });
            };
        }
    );
};
function resetActionView() {
    set_innerText({id: 'action_action', text: ''});
    set_innerText({id: 'action_date',   text: ''});
    set_innerText({id: 'action_user',   text: ''});
    set_innerText({id: 'action_id',     text: ''});
    remove_attribute({id: 'action_user_link', attribute: 'href'});
    ['location', 'serial', 'order', 'loancard', 'nsn', 'issue', 'demand'].forEach(e => {
        set_innerText(   {id: `action_${e}`,      text: ''});
        add_class(       {id: `inp_${e}`,         class: 'hidden'});
        remove_attribute({id: `action_${e}_link`, attribute: 'href'});
    });
};
window.addEventListener('load', function () {
    $('#mdl_action_view').on('show.bs.modal', function (event) {
        resetActionView();
        get(
            {
                table: 'action',
                query: [`action_id=${event.relatedTarget.dataset.action_id}`]
            },
            function (action, options) {
                set_innerText({id: 'action_id',        text: action.action_id});
                set_innerText({id: 'action_action',    text: action._action});
                set_innerText({id: 'action_date',      text: print_date(action.createdAt, true)});
                set_innerText({id: 'action_user',      text: print_user(action.user)});
                set_attribute({id: 'action_user_link', attribute: 'href', value: `/stores/users/${action.user_id}`});
                if (action.stock) {
                    set_innerText({id: 'action_location',      text: action.stock.location._location});
                    set_attribute({id: 'action_location_link', attribute: 'href', value: `/stores/stocks/${action.stock_id}`});
                    remove_class( {id: 'inp_location',         class: 'hidden'});
                } else if (action.serial) {
                    set_innerText({id: 'action_location',      text: action.location._location});
                    set_attribute({id: 'action_location_link', attribute: 'href', value: `/stores/locations/${action.location_id}`});
                    remove_class( {id: 'inp_location',         class: 'hidden'});
                    set_innerText({id: 'action_serial',        text: action.serial._serial});
                    set_attribute({id: 'action_serial_link',   attribute: 'href', value: `/stores/serials/${action.serial_id}`});
                    remove_class( {id: 'inp_serial',           class: 'hidden'});
                };
                if (action.nsn) {
                    set_innerText({id: 'action_nsn',      text: print_nsn(action.nsn)});
                    set_attribute({id: 'action_nsn_link', attribute: 'href', value: `/stores/nsns/${action.nsn_id}`});
                    remove_class( {id: 'inp_nsn',         class: 'hidden'});
                };
                if (action.issue) {
                    set_innerText({id: 'action_issue',      text: action.issue.issue_id});
                    set_attribute({id: 'action_issue_link', attribute: 'href', value: `/stores/issues/${action.issue_id}`});
                    remove_class( {id: 'inp_issue',         class: 'hidden'});
                };
                if (action.order) {
                    set_innerText({id: 'action_order',      text: action.order.order_id});
                    set_attribute({id: 'action_order_link', attribute: 'href', value: `/stores/orders/${action.order_id}`});
                    remove_class( {id: 'inp_order',         class: 'hidden'});
                };
                if (action.loancard_line) {
                    set_innerText({id: 'action_loancard',      text: action.loancard_line.loancard_id});
                    set_attribute({id: 'action_loancard_link', attribute: 'href', value: `/stores/loancards/${action.loancard_line.loancard_id}`});
                    remove_class( {id: 'inp_loancard',         class: 'hidden'});
                };
                if (action.demand_line) {
                    set_innerText({id: 'action_demand',      text: action.demand_line.demand_id});
                    set_attribute({id: 'action_demand_link', attribute: 'href', value: `/stores/demands/${action.demand_line.demand_id}`});
                    remove_class( {id: 'inp_demand',         class: 'hidden'});
                };
            }
        )
    });
    document.querySelector('#reload').addEventListener('click', showActions);
});
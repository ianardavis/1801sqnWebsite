function showIssue() {
    let statuses = {'0': 'Cancelled', '1': 'Requested', '2': 'Approved', '3': 'Ordered', '4': 'Issued', '5': 'Returned'};
    get(
        function (issue, options) {
            set_innerText({id: `user_issue`,      text: print_user(issue.user_issue)});
            set_innerText({id: 'user',            text: print_user(issue.user)});
            set_attribute({id: `user_issue_link`, attribute: 'href', value: `/stores/users/${issue.user_id_issue}`});
            set_attribute({id: 'user_link',       attribute: 'href', value: `/stores/users/${issue.user_id}`});
            set_innerText({id: 'createdAt',       text: print_date(issue.createdAt, true)});
            set_innerText({id: 'updatedAt',       text: print_date(issue.updatedAt, true)});
            set_innerText({id: '_status',         text: statuses[issue._status]});
            set_breadcrumb({
                text: issue.issue_id,
                href: `/stores/issues/${issue.issue_id}`
            });
        },
        {
            table: 'issue',
            query: [`issue_id=${path[3]}`],
            onFail: function () {window.location.href = '/stores/issues'}
        }
    );
};
function showActions() {
    get(
        function (actions, options) {
            set_count({id: 'action', count: actions.length || '0'});
            let table_body = document.querySelector('#tbl_actions');
            if (table_body) {
                table_body.innerHTML = '';
                actions.forEach(action => {
                    try {
                        let row = table_body.insertRow(-1);
                        add_cell(row, {
                            sort: print_date(action.createdAt),
                            text: new Date(action.createdAt).toDateString()
                        });
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
        },
        {
            table: `issue_actions`,
            query: [`issue_id=${path[3]}`]
        }
    );
};
function resetActionView() {
    set_innerText({id: 'action_action',       text: ''});
    set_innerText({id: 'action_user',         text: ''});
    remove_attribute({id: 'action_user_link', attribute: 'href'});
    ['location', 'serial', 'order', 'loancard', 'nsn'].forEach(e => {
        set_innerText(   {id: `action_${e}`,      text: ''});
        add_class(       {id: `inp_${e}`,         class: 'hidden'});
        remove_attribute({id: `action_${e}_link`, attribute: 'href'});
    });
};
$('#mdl_action_view').on('show.bs.modal', function (event) {
    resetActionView();
    get(
        function (action, options) {
            set_innerText({id: 'action_action',    text: action._action});
            set_innerText({id: 'action_user',      text: print_user(action.user)});
            set_attribute({id: 'action_user_link', attribute: 'href', value: `/stores/users/${action.user_id}`});
            if (action.stock) {
                set_innerText({id: 'action_location',      text: action.stock.location._location});
                set_attribute({id: 'action_location_link', attribute: 'href', value: `/stores/stocks/${action.stock_id}`});
                remove_class( {id: 'inp_location',         class: 'hidden'});
            } else if (action.serial) {
                set_innerText({id: 'action_location',      text: action.serial.location._location});
                set_attribute({id: 'action_location_link', attribute: 'href', value: `/stores/serials/${action.serial_id}`});
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
        },
        {
            table: 'issue_action',
            query: [`action_id=${event.relatedTarget.dataset.action_id}`]
        }
    )
});
document.querySelector('#reload').addEventListener('click', showIssue);
document.querySelector('#reload').addEventListener('click', showActions);
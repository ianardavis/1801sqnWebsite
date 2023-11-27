const statuses = {"0": "Cancelled", "1": "Draft", "2": "Complete", "3": "Closed"};
function get_demand() {
    function disable_all_buttons() {
        disableButton('download');
        disableButton('close');
        disableButton('complete');
        disableButton('delete');
        disableButton('action');
        disableButton('line_add');
    };
    function display_details([demand, options]) {
        setBreadcrumb(`${demand.supplier.name} - ${print_date(demand.createdAt)}`);
        setInnerText('demand_supplier',  demand.supplier.name);
        setInnerText('demand_user',      print_user(demand.user));
        setInnerText('demand_createdAt', print_date(demand.createdAt, true));
        setInnerText('demand_updatedAt', print_date(demand.updatedAt, true));
        setInnerText('demand_file',      (demand.filename ? demand.filename : ''));
        document.querySelectorAll('.demand_id').forEach(e => e.setAttribute('value', demand.demand_id));
        return demand;
    };
    function set_links(demand) {
        setHREF('demand_supplier_link', `/suppliers/${demand.supplier_id}`);
        setHREF('demand_user_link',     `/users/${demand.user_id}`);
        return demand;
    };
    function set_status_badges(demand) {
        clear_statuses(3, statuses);
        if ([0, 1, 2, 3].includes(demand.status)) {
            if (demand.status === 0) {
                set_badge(1, 'danger', 'Cancelled');

            } else {
                set_badge(1, 'success');
                if (demand.status > 1) {
                    set_badge(2, 'success');
                };
                if (demand.status > 2) {
                    set_badge(3, 'success');
                };
            };
        };
        return demand;
    };
    function set_button_states(demand) {
        if (demand.status > 1 || demand.filename) enableButton('download');
        if (demand.status === 2)                  enableButton('close');
        if (demand.status === 1) {
            enableButton('complete');
            enableButton('line_add');
        };
        if ([1, 2].includes(demand.status)) {
            enableButton('delete');
            enableButton('action');
        };
        return demand;
    };

    disable_all_buttons();
    get({
        table: 'demand',
        where: {demand_id: path[2]}
    })
    .then(display_details)
    .then(set_links)
    .then(set_status_badges)
    .then(set_button_states)
    .catch(err => redirect_on_error(err, '/demands'));
};
window.addEventListener('load', function () {
    set_attribute('form_download', 'action', `/demands/${path[2]}/download`);
    addFormListener(
        'complete',
        'PUT',
        `/demands/${path[2]}/complete`,
        {
            onComplete: [
                get_demand,
                get_lines
            ]
        }
    );
    addFormListener(
        'close',
        'PUT',
        `/demands/${path[2]}/close`,
        {
            onComplete: [
                get_demand,
                get_lines
            ]
        }
    );
    add_listener('reload', get_demand);
    get_demand();
});
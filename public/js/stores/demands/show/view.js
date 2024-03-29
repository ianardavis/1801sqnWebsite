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
        setBreadcrumb(`${demand.supplier.name} - ${printDate(demand.createdAt)}`);
        setInnerText('demand_supplier',  demand.supplier.name);
        setInnerText('demand_user',      printUser(demand.user));
        setInnerText('demand_createdAt', printDate(demand.createdAt, true));
        setInnerText('demand_updatedAt', printDate(demand.updatedAt, true));
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
        clearStatuses(3, statuses);
        if ([0, 1, 2, 3].includes(demand.status)) {
            if (demand.status === 0) {
                setBadge(1, 'danger', 'Cancelled');

            } else {
                setBadge(1, 'success');
                if (demand.status > 1) {
                    setBadge(2, 'success');
                };
                if (demand.status > 2) {
                    setBadge(3, 'success');
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
    .catch(err => redirectOnError(err, '/demands'));
};
window.addEventListener('load', function () {
    setAttribute('form_download', 'action', `/demands/${path[2]}/download`);
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
    addListener('reload', get_demand);
    get_demand();
});
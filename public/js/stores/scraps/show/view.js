const statuses = {"0": "Cancelled", "1": "Draft", "2": "Closed"};
function getScrap() {
    function disable_all_buttons() {
        disable_button('scrap_complete');
        disable_button('scrap_file_print');
        disable_button('scrap_file_download');
        disable_button('scrap_file_delete');
        disable_button('delete');
        disable_button('lines_action');
    };
    function display_details([scrap, options]) {
        set_breadcrumb(`${scrap.supplier.name} | ${print_date(scrap.createdAt)}`);
        set_innerText('scrap_supplier',  scrap.supplier.name);
        set_innerText('scrap_createdAt', print_date(scrap.createdAt, true));
        set_innerText('scrap_updatedAt', print_date(scrap.updatedAt, true));
        set_innerText('scrap_filename',  scrap.filename || '');
        return scrap;
    };
    function set_links(scrap) {
        set_href('scrap_supplier_link', `/suppliers/${scrap.supplier_id}`);
        return scrap;
    };
    function set_status_badges(scrap) {
        clear_statuses(3, statuses);
        if ([0, 1, 2, 3].includes(scrap.status)) {
            if (scrap.status === 0) {
                set_badge(1, 'danger', 'Cancelled');

            } else {
                set_badge(1, 'success');
                if (scrap.status > 1) {
                    set_badge(2, 'success');
                };
            };
        };
        return scrap;
    };
    function set_button_states(scrap) {
        if (scrap.status == 1) {
            enableButton('scrap_complete');
            enableButton('delete');
            enableButton('lines_action');
        };
        if (scrap.status == 2) {
            enableButton('scrap_file_print');
            enableButton('scrap_file_download');
            if (scrap.filename) enableButton('scrap_file_delete');
            set_attribute('form_scrap_file_download', 'method', 'GET');
            set_attribute('form_scrap_file_download', 'action', `/scraps/${scrap.scrap_id}/download`);
        } else {
            set_attribute('form_scrap_file_download', 'method');
            set_attribute('form_scrap_file_download', 'action');
        };
        return scrap;
    };
    
    disable_all_buttons();
    get({
        table: 'scrap',
        where: {scrap_id: path[2]}
    })
    .then(display_details)
    .then(set_links)
    .then(set_status_badges)
    .then(set_button_states);
};

window.addEventListener('load', function () {
    add_listener('reload', getScrap);
    addFormListener(
        'scrap_file_print',
        'GET',
        `/scraps/${path[2]}/print`
    );
    addFormListener(
        'delete',
        'DELETE',
        `/scraps/${path[2]}`,
        {
            onComplete: [
                getScrap,
                getLines
            ]
        }
    );
    addFormListener(
        'scrap_complete',
        'PUT',
        `/scraps/${path[2]}/complete`,
        {
            onComplete: [
                getScrap,
                getLines
            ]
        }
    );
    addFormListener(
        'scrap_file_delete',
        'DELETE',
        `/scraps/${path[2]}/file`,
        {onComplete: [getScrap]}
    );
    getScrap();
});
const statuses = {"0": "Cancelled", "1": "Draft", "2": "Closed"};
function getScrap() {
    function disable_all_buttons() {
        disableButton('scrap_complete');
        disableButton('scrap_file_print');
        disableButton('scrap_file_download');
        disableButton('scrap_file_delete');
        disableButton('delete');
        disableButton('lines_action');
    };
    function display_details([scrap, options]) {
        setBreadcrumb(`${scrap.supplier.name} | ${printDate(scrap.createdAt)}`);
        setInnerText('scrap_supplier',  scrap.supplier.name);
        setInnerText('scrap_createdAt', printDate(scrap.createdAt, true));
        setInnerText('scrap_updatedAt', printDate(scrap.updatedAt, true));
        setInnerText('scrap_filename',  scrap.filename || '');
        return scrap;
    };
    function set_links(scrap) {
        setHREF('scrap_supplier_link', `/suppliers/${scrap.supplier_id}`);
        return scrap;
    };
    function set_status_badges(scrap) {
        clearStatuses(3, statuses);
        if ([0, 1, 2, 3].includes(scrap.status)) {
            if (scrap.status === 0) {
                setBadge(1, 'danger', 'Cancelled');

            } else {
                setBadge(1, 'success');
                if (scrap.status > 1) {
                    setBadge(2, 'success');
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
            setAttribute('form_scrap_file_download', 'method', 'GET');
            setAttribute('form_scrap_file_download', 'action', `/scraps/${scrap.scrap_id}/download`);
        } else {
            setAttribute('form_scrap_file_download', 'method');
            setAttribute('form_scrap_file_download', 'action');
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
    addListener('reload', getScrap);
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
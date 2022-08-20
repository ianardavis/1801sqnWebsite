let statuses = {"0": "Cancelled", "1": "Draft", "2": "Closed"};
function getScrap() {
    disable_button('scrap_complete');
    disable_button('scrap_file_print');
    disable_button('scrap_file_download');
    disable_button('scrap_file_delete');
    get({
        table: 'scrap',
        where: {scrap_id: path[2]}
    })
    .then(function ([scrap, options]) {
        set_breadcrumb(`${scrap.supplier.name} | ${print_date(scrap.createdAt)}`);
        set_innerText('scrap_supplier',  scrap.supplier.name);
        set_innerText('scrap_createdAt', print_date(scrap.createdAt, true));
        set_innerText('scrap_updatedAt', print_date(scrap.updatedAt, true));
        set_innerText('scrap_status',    statuses[scrap.status]);
        set_innerText('scrap_filename',  scrap.filename || '')
        set_href('scrap_supplier_link', `/suppliers/${scrap.supplier_id}`);
        if (scrap.status == 1) {
            enable_button('scrap_complete');
            enable_button('scrap_delete');
        };
        if (scrap.status == 2) {
            enable_button('scrap_file_print');
            enable_button('scrap_file_download');
            if (scrap.filename) enable_button('scrap_file_delete');
            set_attribute('form_scrap_file_download', 'method', 'GET');
            set_attribute('form_scrap_file_download', 'action', `/scraps/${scrap.scrap_id}/download`);
        } else {
            set_attribute('form_scrap_file_download', 'method');
            set_attribute('form_scrap_file_download', 'action');
        };
        return scrap.status;
    })
    .then(status => {
        if (typeof setDeleteButton === 'function') setDeleteButton(status);
        if (typeof setActionButton === 'function') setActionButton(status);
    });
};
addReloadListener(getScrap);
window.addEventListener('load', function () {
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
                function () {if (typeof getLines === 'function') getLines()}
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
                function () {if (typeof getLines === 'function') getLines()}
            ]
        }
    );
    addFormListener(
        'scrap_file_delete',
        'DELETE',
        `/scraps/${path[2]}/delete_file`,
        {onComplete: [getScrap]}
    );
});
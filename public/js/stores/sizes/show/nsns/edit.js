function edit_nsn() {
    show('div_nsn_edit');
    hide('btn_nsn_edit');
    hide('div_nsn_view');
};
function reset_nsn() {
    hide('div_nsn_edit');
    show('btn_nsn_edit');
    show('div_nsn_view');
};
window.addEventListener('load', function () {
    let groups = document.querySelector('#nsn_group_id_edit');
    if (groups) groups.addEventListener('change', function () {
        getNSNClassifications({select: 'edit'});
    });
    $('#mdl_nsn_view').on('show.bs.modal', function(event) {
        reset_nsn();
        get(
            function(nsn, options) {
                set_attribute({id: 'nsn_id_edit',       attribute: 'id',    value: nsn.nsn_id});
                set_attribute({id: 'nsn_edit_cancel',   attribute: 'href',  value: `javascript:getNSNEdit('${nsn.nsn_id}')`});
                set_attribute({id: '_item_number_edit', attribute: 'value', value: nsn._item_number});
                getNSNGroups({
                    select:                  'edit',
                    selected:                nsn.nsn_group_id,
                    selected_classification: nsn.nsn_classification_id
                });
                getNSNCountries({
                    select:   'edit',
                    selected: nsn.nsn_country_id
                });
                addFormListener(
                    'form_nsn_edit',
                    'PUT',
                    '/stores/nsns',
                    {
                        onComplete: [
                            getNSNs,
                            function () {$('#mdl_nsn_view').modal('hide')}
                        ]
                    }
                );
                let span_nsn_edit = document.querySelector('#span_nsn_edit');
                if (span_nsn_edit) {
                    span_nsn_edit.innerHTML = '';
                    span_nsn_edit.appendChild(
                        new Button({
                            attributes: [
                                {field: 'id', value: 'btn_nsn_edit'}
                            ],
                            type:  'success',
                            html:  '<i class="fas fa-pencil-alt"></i>',
                            click: edit_nsn,
                            float: true
                        }).e
                    );
                };
            },
            {
                table:   'nsn',
                query:   [`nsn_id=${event.relatedTarget.dataset.nsn_id}`],
                spinner: 'nsn_view'
            }
        );
    });
});
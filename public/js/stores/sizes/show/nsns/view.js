function getNSNs() {
    get(
        function (nsns, options) {
            try {
                clearElement('tbl_nsns');
                let tbl_nsns = document.querySelector('#tbl_nsns');
                set_count({id: 'nsn', count: nsns.length});
                if (tbl_nsns) {
                    nsns.forEach(nsn => {
                        let row = tbl_nsns.insertRow(-1);
                        add_cell(row, {text: print_nsn(nsn)});
                        if (nsn.size.nsn_id === nsn.nsn_id) {
                            add_cell(row, {html: '<i class="fas fa-check"></i>'});
                        } else add_cell(row);
                        add_cell(row, {append: new Link({
                            modal: 'nsn_view',
                            data:  {field: 'nsn_id', value: nsn.nsn_id},
                            small: true
                        }).e}
                        );
                    });
                };
            } catch (error) {console.log(error)};
        },
        {
            table: 'nsns',
            query: [`size_id=${path[3]}`]
        }
    );
};
function getNSNView(nsn_id, permissions) {
    get(
        function(nsn, options) {
            set_innerText({id: 'nsn_group_id',          text: `${String(nsn.group._code).padStart(2, '0')} | ${nsn.group._group}`});
            set_innerText({id: 'nsn_classification_id', text: `${String(nsn.classification._code).padStart(2, '0')} | ${nsn.classification._classification}`});
            set_innerText({id: 'nsn_country_id',        text: `${String(nsn.country._code).padStart(2, '0')} | ${nsn.country._country}`});
            set_innerText({id: '_item_number',          text: nsn._item_number});
            set_innerText({id: 'nsn_id',                text: nsn.nsn_id});
            set_innerText({id: '_nsn_view',             text: print_nsn(nsn)});
            set_innerText({id: '_default',              text: yesno((nsn.nsn_id === nsn.size.nsn_id))});
            if (permissions.edit === true || permissions.delete === true) {
                let nsn_buttons = document.querySelector('#nsn_buttons');
                if (nsn_buttons) {
                    nsn_buttons.innerHTML = '';
                    if (permissions.delete) {
                        nsn_buttons.appendChild(
                            new Delete_Button({
                                path: `/stores/nsns/${nsn.nsn_id}`,
                                descriptor: 'NSN',
                                float: true,
                                options: {
                                    onComplete: [
                                        getNSNs,
                                        function () {$('#mdl_nsn_view').modal('hide')}
                                    ]
                                }
                            }).e
                        );
                    };
                    if (permissions.edit) {
                        nsn_buttons.appendChild(
                            new Button({
                                id: 'btn_nsn_edit',
                                type: 'success',
                                html: '<i class="fas fa-pencil-alt"></i>',
                                click: edit_nsn,
                                float:      true,
                                classes: ['mr-1']
                            }).e
                        );
                    };
                };
            };
        },
        {
            table: 'nsn',
            query: [`nsn_id=${nsn_id}`],
            spinner: 'nsn_view'
        }
    );
};
document.querySelector('#reload').addEventListener('click', getNSNs);
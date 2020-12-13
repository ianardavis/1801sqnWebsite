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
function getNSNNotes(nsn_id) {
    get(
        function(notes, options) {
            let tbl_nsn_notes = document.querySelector('#tbl_nsn_notes');
            if (tbl_nsn_notes) {
                tbl_nsn_notes.innerHTML = '';
                set_count({id: 'nsn_note', count: notes.length});
                notes.forEach(note => {
                    let row = tbl_nsn_notes.insertRow(-1);
                    add_cell(row, {
                        text: print_date(note.createdAt, true),
                        sort: new Date (note.createdAt).getTime()
                    });
                    if (note._system === 1) add_cell(row, {html: '<i class="fas fa-check"></i>'})
                    else                    add_cell(row);
                    add_cell(row, {text: note._note});
                    add_cell(row, {text: print_user(note.user)});
                    add_cell(row, {append: new Link({type: 'edit', small: true}).e});
                    add_cell(row, {append: new Delete_Button({
                        descriptor: 'note',
                        small: true,
                        path: `/stores/notes/${note.note_id}`,
                        options: {
                            onComplete: getNSNNotes,
                            args: [nsn_id]
                        }
                    }).e});
                });
            }
        },
        {
            table: 'notes',
            query: ['_table=nsns',`_id=${nsn_id}`]
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
                                        function () {$('mdl_nsn_view').modal('hide')}
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
                                click: edit_nsn
                            }).e
                        );
                    };
                };
            };
        },
        {
            table: 'nsn',
            query: [`nsn_id=${nsn_id}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getNSNs);
$('#mdl_nsn_view').on('show.bs.modal', function(event) {getNSNNotes(event.relatedTarget.dataset.nsn_id)});
function getNotes() {
    get(
        function (notes, options) {
            set_count({id: 'note', count: notes.length || 0})
            let table_body = document.querySelector('#tbl_notes');
            if (table_body) {
                table_body.innerHTML = '';
                notes.forEach(note => {
                    let row = table_body.insertRow(-1);
                    add_cell(row, {
                        sort: new Date(note.createdAt).getTime(),
                        text: new Date(note.createdAt).toDateString()
                    });
                    add_cell(row, {text: note._note, ellipsis: true});
                    add_cell(row, {append: new Link({
                        modal: 'note_view',
                        data: {field: 'note_id', value: note.note_id},
                        small: true
                    }).e});
                });
            };
        },
        {
            db:    path[1],
            table: 'notes',
            query: note_query()
        }
    );
};
function getNote(note_id, permissions) {
    get(
        function (note, options) {
            set_innerText({id: 'note_id_view',   text: note.note_id});
            set_innerText({id: 'note_createdAt', text: print_date(note.createdAt)});
            set_innerText({id: 'note_user',      text: print_user(note.user)});
            set_attribute({id: 'note_user_link', attribute: 'href', value: `/${path[1]}/users/${note.user_id}`});
            set_innerText({id: 'note_system',    text: yesno(note._system)});
            set_innerText({id: 'note_note',      text: note._note});
            let note_view_buttons = document.querySelector('#note_view_buttons');
            if (note_view_buttons) {
                note_view_buttons.innerHTML = '';
                if (!note._system && permissions.delete) {
                    note_view_buttons.appendChild(
                        new Delete_Button({
                            path: `/stores/notes/${note.note_id}`,
                            float: true,
                            descriptor: 'note',
                            options: {
                                onComplete: [
                                    getNotes,
                                    function () {$('#mdl_note_view').modal('hide')}
                                ]
                            }
                        }).e
                    );
                };
                if (!note._system && permissions.edit) {
                    note_view_buttons.appendChild(new Link({
                        classes: ['mr-1'],
                        modal:   'note_edit',
                        data:    {field: 'note_id', value: note.note_id},
                        float:   true,
                        type:    'edit'
                    }).e);
                };
            };
        },
        {
            db:      path[1],
            table:   'note',
            query:   [`note_id=${note_id}`],
            spinner: 'note_view'
        }
    )
};
function note_query() {
    let sel_system = document.querySelector('#sel_system'), query = [];
    query.push(`_table=${path[2]}`);
    query.push(`_id=${path[3]}`);
    if (sel_system.value !== '') query.push(sel_system.value);
    return query;
};
document.querySelector('#sel_system').addEventListener('change', getNotes);
document.querySelector('#reload').addEventListener('click', getNotes);
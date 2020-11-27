function showNotes (notes, options = {}) {
    clearElement('tbl_notes');
    clearElement('note_modals');
    let table_body = document.querySelector('#tbl_notes'),
        note_count = document.querySelector('#note_count');
    note_count.innerText = notes.length || 0;
    notes.forEach(note => {
        let row = table_body.insertRow(-1);
        add_cell(row, {
            sort: new Date(note.createdAt).getTime(),
            text: new Date(note.createdAt).toDateString()
        });
        add_cell(row, {text: note._note, ellipsis: true});
        add_note_modal(note, row, options.permissions);
    });
    hide_spinner('notes');
};
function note_query () {
    let sel_notes = document.querySelector('#sel_system'),
        query     = ['_table=' + path[2], '_id=' + path[3]];
    if (sel_notes.value !== '') query.push(sel_notes.value);
    return query;
};
function add_note_modal (note, row, permissions) {
    let div_modals = document.querySelector('#note_modals');
    add_cell(row, {append: new Modal_Link({id: `note_${note.note_id}`}).e, id: `mdl_cell_note_${note.note_id}`});
    div_modals.appendChild(new Modal({id: `note_${note.note_id}`, static: true}).e);
    let mdl_title  = document.querySelector(`#mdl_note_${note.note_id}_title`),
        mdl_body   = document.querySelector(`#mdl_note_${note.note_id}_body`);
    if (mdl_title) mdl_title.innerText = `Note ${note.note_id}`;
    if (mdl_body) {
        mdl_body.appendChild(new Input_Group({title: 'Added',    text:  `${new Date(note.createdAt).toDateString()} ${new Date(note.createdAt).toLocaleTimeString()}`}).e);
        mdl_body.appendChild(new Input_Group({title: 'Added By', text:  `${note.user.rank._rank } ${note.user.full_name}`, link: `/stores/users/${note.user_id}`}).e);
        mdl_body.appendChild(new Input_Group({title: 'System',   text:  yesno(note._system)}).e)
        mdl_body.appendChild(new Input_Group({title: 'Note',     append: new Textarea({text: note._note, disabled: true}).e}).e);
    };
    if (!note._system) {
        let mdl_header = document.querySelector(`#mdl_note_${note.note_id}_header`),
            btn_container = document.createElement('div');
        btn_container.classList.add('float-right');
        if (permissions.edit) {
            btn_container.appendChild(new Link({
                href: `javascript:edit("notes",${note.note_id})`,
                float: true,
                type: 'edit'
            }).e)
        };
        if (permissions.delete) {
            btn_container.appendChild(
                new DeleteButton({
                    path: `/stores/notes/${note.note_id}`,
                    float: true,
                    descriptor: 'note',
                    options: {onComplete: getNotes, args: []}
                }).e
            );
        };
        mdl_header.appendChild(btn_container);
    };
};
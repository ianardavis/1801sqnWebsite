function getNSNs() {
    get(
        function (nsns, options) {
            try {
                clearElement('tbl_nsns');
                clearElement('nsn_modals');
                let table_body = document.querySelector('#tbl_nsns');
                set_count({id: 'nsn', count: nsns.length});
                nsns.forEach(nsn => {
                    let row  = table_body.insertRow(-1),
                        _nsn = `${String(nsn.group._code).padStart(2, '0')}${String(nsn.classification._code).padStart(2, '0')}-${String(nsn.country._code).padStart(2, '0')}-${nsn._item_number}`;
                    add_cell(row, {text: _nsn});
                    if (nsn.size.nsn_id === nsn.nsn_id) {
                        add_cell(row, {html: '<i class="fas fa-check"></i>'});
                    } else add_cell(row);
                    add_cell(row, {append: new Link({
                        modal: `view_nsn`,
                        data: nsn.nsn_id,
                        small: true}).e}
                    );
                });
            } catch (error) {console.log(error)};
        },
        {
            table: 'nsns',
            query: [`size_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getNSNs);
function getNSN(nsn_id) {
    get(
        function(nsn, options) {
            console.log(nsn);
            let nsn_edit_cancel = document.querySelector('#nsn_edit_cancel');
            if (nsn_edit_cancel) nsn_edit_cancel.setAttribute('href', `javascript:getNSN('${nsn.nsn_id}')`);
            let _nsn_view = document.querySelector('#_nsn_view');
            if (_nsn_view) _nsn_view.innerText = `${String(nsn.group._code).padStart(2, '0')}${String(nsn.classification._code).padStart(2, '0')}-${String(nsn.country._code).padStart(2, '0')}-${nsn._item_number}`;
        },
        {
            table: 'nsn',
            query: [`nsn_id=${nsn_id}`]
        }
    );
};
function getNSNNotes(nsn_id) {
    get(
        function(notes, options) {
            let tbl_nsn_notes = document.querySelector('#tbl_nsn_notes');
            if (tbl_nsn_notes) {
                tbl_nsn_notes.innerHTML = '';
                set_count('nsn_note', notes.length);
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
                        small: true,
                        descriptor: 'note',
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
}
$('#mdl_view_nsn').on('show.bs.modal', function(event) {getNSN(event.relatedTarget.dataset.nsn_id)});
$('#mdl_view_nsn').on('show.bs.modal', function(event) {getNSNNotes(event.relatedTarget.dataset.nsn_id)});
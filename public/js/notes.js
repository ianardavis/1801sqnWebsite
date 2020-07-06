function getNotes(table, id, delete_permission) {
    let spn_notes = document.querySelector('#spn_notes');
    spn_notes.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", function(event) {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#notesTable');
        table_body.innerHTML = '';
        if (response.result) {
            let note_count = document.querySelector('#note_count');
            note_count.innerText = response.notes.length;
            response.notes.forEach(note => {
                let row = table_body.insertRow(-1);
                add_cell(row, {
                    sort: new Date(note._date).getTime(),
                    text: new Date(note._date).toDateString()
                });
                if (note._system) add_cell(row, {html: _check()})
                else add_cell(row);
                add_cell(row, {text: note._note, ellipsis: true});
                add_cell(row, {text: note.user.rank._rank + ' ' + note.user.full_name});
                if (!note._system) add_cell(row, {append: new Link({
                    href: 'javascript:edit("notes",' + note.note_id + ')',
                    small: true
                }).link})
                else add_cell(row);
                if (delete_permission) add_cell(row, {append: new DeleteButton({
                    path: '/stores/notes/' + note.note_id,
                    small: true
                }).form});
            });
        } else alert('Error: ' + response.error)
        spn_notes.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Something went wrong getting notes'));
    let sel_notes = document.querySelector('#sel_system'),
        query     = ['_table=' + table, '_id=' + id];
    if      (Number(sel_notes.value) === 2) query.push('_system=0')
    else if (Number(sel_notes.value) === 3) query.push('_system=1');
    XHR.open('GET', '/stores/get/notes?' + query.join('&'));
    XHR.send();
};
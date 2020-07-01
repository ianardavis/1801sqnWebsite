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
                let row   = table_body.insertRow(-1),
                    cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1),
                    cell5 = row.insertCell(-1);
                cell1.dataset.sort = new Date(note._date).getTime();
                cell1.innerText    = new Date(note._date).toDateString();
                if (note._system) cell2.innerHTML = _check();
                cell3.innerText    = note._note;
                cell4.innerText    = note.user.rank._rank + ' ' + note.user.full_name
                if (!note._system) cell5.appendChild(link('javascript:edit("notes",' + note.note_id + ',{"height":600})', false));
                if (delete_permission) {
                    let cell6 = row.insertCell(-1);
                    if (!note._system) cell6.appendChild(deleteBtn('/stores/notes/' + note.note_id));
                };
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
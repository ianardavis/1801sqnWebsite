let _table       = document.querySelector('#_table'),
    _id          = document.querySelector('#_id'),
    btn_add_note = document.querySelector('#btn_add_note');
if (_table) _table.setAttribute('value', path[2]);
if (_id)    _id.setAttribute('value', path[3]);
if (btn_add_note) btn_add_note.addEventListener('click', function () {$('#mdl_add_note').modal('show')});
addFormListener(
    'form_add_note',
    'POST',
    `/${path[1]}/notes`,
    {
        onComplete: [
            getNotes,
            function () {
                let _note = document.querySelector('#_note');
                if (_note) _note.innerText = '';
                $('#mdl_add_note').modal('hide');
            }
        ]
    }
);
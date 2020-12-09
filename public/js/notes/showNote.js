function showNote (notes, options) {
    if (notes.length === 1) {
        let _note = document.querySelector('#_note');
        if (_note) _note.innerText = notes[0]._note;
    } else alert(`${notes.length} matching notes found`);
};
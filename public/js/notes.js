var noteWindow = null;
function addNote(table, id) {
    if (noteWindow === null || noteWindow.closed) {
        noteWindow = window.open("/notes/new?table=" + table + '&id=' + id,
                                "Notes",
                                "width=600,height=840,resizeable=no,location=no");
    } else noteWindow.focus();
};
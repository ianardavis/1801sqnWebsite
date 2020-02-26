function show_children(table, parent_id) {
    let children = document.querySelectorAll('#' + table + ' tr');
    let new_parent = document.querySelector('#' + table + '_parent');
    new_parent.value = parent_id;
    children.forEach(child => {
        if (child.dataset.parent === parent_id) {
            child.style.display = "";
        } else child.style.display = "none"
    });
};

function radio(_radio) {
    show_children(_radio.table, _radio.id);
    if (_radio.table === 'group') {
        show_children('type', -1);
        show_children('subtype', -1);
    } else if (_radio.table === 'type') {
        show_children('subtype', -1);
    };
};
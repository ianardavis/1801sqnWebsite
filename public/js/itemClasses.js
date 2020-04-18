function setGroup(zeroise = true) {
    var category = document.querySelector('#sel_category');
    if (category.value === '') {
        hideAll("sel_group");
    } else {
        hideSome("sel_group", category.value, zeroise);
    };
    setType(zeroise);
};
function setType(zeroise = true) {
    var group = document.querySelector('#sel_group');
    if (group.value === '') {
        hideAll("sel_type");
    } else {
        hideSome("sel_type", group.value, zeroise);
    };
    setSubtype(zeroise);
};
function setSubtype(zeroise = true) {
    var type = document.querySelector('#sel_type');
    if (type.value === '') {
        hideAll("sel_subtype");
    } else {
        hideSome("sel_subtype", type.value, zeroise);
    };
};
function hideSome(select, selected, zeroise = true) {
    var _select = document.querySelector('#' + select);
    if (zeroise) _select.value = '<blank>'
    for (var o = 0; o < _select.length; o++) {
        var option = _select.options[o]
        if (option.dataset.tag === selected || option.dataset.tag === '<blank>') {
            option.style.display = 'block';
        } else {
            option.style.display = 'none';
        };
    };
};
function hideAll(select) {
    var _select = document.querySelector('#' + select);
    _select.value = '<blank>';
    for (var o = 0; o < _select.length; o++) {
        var option = _select.options[o];
        if (option.value !== '<blank>');
        option.style.display = 'none';
    };
};
setGroup(false);
function filter() {
    var filters = [];
    var cat = document.querySelector("#category_id");
    var grp = document.querySelector("#group_id");
    var typ = document.querySelector("#type_id");
    var sub = document.querySelector("#subtype_id");
    var gen = document.querySelector("#gender_id");
    if (cat.value !== '') {filters.push("cat=" + cat.value)};
    if (grp.value !== '') {filters.push("grp=" + grp.value)};
    if (typ.value !== '') {filters.push("typ=" + typ.value)};
    if (sub.value !== '') {filters.push("sub=" + sub.value)};
    if (gen.value !== '') {filters.push("gen=" + gen.value)};
    window.location.replace("/stores/items?" + filters.join("&"))
}
function setGroup(zeroise = true) {
    var category = document.querySelector('#category_id');
    if (category.value === '') {
        hideAll("group_id");
    } else {
        hideSome("group_id", category.value, zeroise);
    };
    setType(zeroise);
};
function setType(zeroise = true) {
    var group = document.querySelector('#group_id');
    if (group.value === '') {
        hideAll("type_id");
    } else {
        hideSome("type_id", group.value, zeroise);
    };
    setSubtype(zeroise);
};
function setSubtype(zeroise = true) {
    var type = document.querySelector('#type_id');
    if (type.value === '') {
        hideAll("subtype_id");
    } else {
        hideSome("subtype_id", type.value, zeroise);
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
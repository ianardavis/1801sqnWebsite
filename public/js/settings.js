function setGroups() {
    var category = document.querySelector('#category_id').value,
        group_id = document.querySelector('#group_category_id');
    setEdit('category_id');
    setID('category_id', 'delete');
    setID('category_id', 'edit');
    group_id.value = category;
    if (category !== '') {
        hideSome('group_id', category);
        setTypes();
    } else {
        hideAll('group_id');
        hideAll("type_id");
        hideAll("subtype_id");
    };
};
function setTypes() {
    var group = document.querySelector('#group_id').value,
        group_id = document.querySelector('#type_group_id');
    setEdit('group_id');
    setID('group_id', 'delete');
    setID('group_id', 'edit');
    group_id.value = group;
    if (group !== '') {
        hideSome("type_id", group);
        setSubtypes();
    } else {
        hideAll("type_id");
        hideAll("subtype_id");
    };
};
function setSubtypes() {
    var type = document.querySelector('#type_id').value,
        type_id = document.querySelector('#subtype_type_id');
    setEdit('type_id');
    setID('type_id', 'delete');
    setID('type_id', 'edit');
    type_id.value = type;
    if (type !== '') {
        hideSome("subtype_id", type);
    } else {
        hideAll("subtype_id");
    };
};
function setSubTypeID() {
    setEdit('subtype_id');
    setID('subtype_id', 'delete');
    setID('subtype_id', 'edit');
};
function hideSome(select, parent) {
    var _select = document.querySelector('#' + select);
    _select.value = '';
    for (var o = 0; o < _select.length; o++) {
        var option = _select.options[o]
        if (option.dataset.tag === parent) {
            option.style.display = 'block';
        } else {
            option.style.display = 'none';
        };
    };
};
function hideAll(select) {
    var _select = document.querySelector('#' + select);
    for (var o = 0; o < _select.length; o++) {
        var option = _select.options[o];
        option.style.display = 'none';
    };
};
function setEdit(field) {
    var sel = document.querySelector('#' + field),
        edit = document.querySelector('#' + field + '_edit');
    if (sel.options[sel.selectedIndex]) {
        edit.value = sel.options[sel.selectedIndex].text;
    } else {
        edit.value = "";
    };
};
function setID(_id, action) {
    console.log(_id, action);
    var field = document.querySelector('#' + _id).value,
        child = document.querySelector('#' + action + '_' + _id),
        obj = {};
    obj[_id] = field
    child.value = JSON.stringify(obj);
};
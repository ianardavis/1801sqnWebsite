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
};
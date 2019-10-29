function filter() {
    var filters = [];
    if ($("#_category").val() != '') {filters.push("category=" + $("#_category").val());}
    if ($("#_group").val() != '') {filters.push("group=" + $("#_group").val());}
    if ($("#_type").val() != '') {filters.push("type=" + $("#_type").val());}
    if ($("#_sub_type").val() != '') {filters.push("subtype=" + $("#_sub_type").val());}
    if ($("#_gender").val() != '') {filters.push("gender=" + $("#_gender").val());}
    window.location.replace("/stores/items?" + filters.join("&"))
}
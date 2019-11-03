function filter() {
    var filters = [];
    if ($("#category_id").val() != '') {filters.push("category=" + $("#category_id").val());}
    if ($("#group_id").val() != '')    {filters.push("group=" +    $("#group_id").val());}
    if ($("#type_id").val() != '')     {filters.push("type=" +     $("#type_id").val());}
    if ($("#subtype_id").val() != '')  {filters.push("subtype=" +  $("#subtype_id").val());}
    if ($("#gender_id").val() != '')   {filters.push("gender=" +   $("#gender_id").val());}
    window.location.replace("/stores/items?" + filters.join("&"))
}
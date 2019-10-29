$(window).on("load", () => {
    $('#_category').val(<%= category %>);
    setGroup;
    $('#_group').val(<%= group %>);
    setType;
    $('#_type').val(<%= type %>);
    setSubtype;
    $('#_sub_type').val(<%= subtype %>);
    $('#_gender').val(<%= gender %>);
});
$('#_category').on('change', setGroup);	
$('#_group').on('change', setType);	
$('#_type').on('change', setSubtype);

function setGroup() {
    hideSome("_group", $(this).val());
    $("#_group").val($("#_group option:visible:first").val());
    $("#_type").val($("#_type option:visible:first").val());
    $("#_sub_type").val($("#_sub_type option:visible:first").val());
    hideAll("_type")
    hideAll("_sub_type")
}
function setType() {
    hideSome("_type", $(this).val());
    $("#_type").val($("#_type option:visible:first").val());
    $("#_sub_type").val($("#_sub_type option:visible:first").val());
    hideAll("_sub_type")
}
function setSubtype() {
    hideSome("_sub_type", $(this).val());
    $("#_sub_type").val($("#_sub_type option:visible:first").val());
}
function hideSome(select, selected) {
    $("#" + select + " option").each(function(item){
        var element =  $(this) ; 
        if (element.data("tag") != selected && element.data("tag") != '<blank>'){
            element.hide() ; 
        } else {
            element.show();
        }
    }) ; 
}
function hideAll(select) {
    $("#" + select + " option").each(function(item){
        var element =  $(this) ; 
        element.hide() ; 
    }) ; 
}
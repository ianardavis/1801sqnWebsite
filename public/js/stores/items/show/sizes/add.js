function resetAddSize() {
    ['_issueable', '_orderable', '_nsns', '_serials'].forEach(e => set_value({id: e, value: '0'}));
    set_value({id: '_size', value: ''});
    listSuppliers({
        select: 'sel_suppliers',
        blank: true
    });
};
window.addEventListener('load', function () {
    $('#mdl_size_add').on('show.bs.modal', resetAddSize);
    remove_attribute({id: 'btn_size_add', attribute: 'disabled'});
    addFormListener(
        'size_add',
        'POST',
        '/sizes',
        {onComplete: [
            getSizes,
            function () {set_value({id: '_size', value: ''})}
        ]}
    );
    document.querySelector('#reload_suppliers').addEventListener('click', function (){
        listSuppliers({
            select: 'sel_suppliers',
            blank: true
        });
    });
});
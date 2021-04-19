function getDetailOptions() {
    get({
        table: 'settings',
        query: ['name=detail_option'],
        spinner: 'detail_options'
    })
    .then(function ([settings, options]) {
        let list = document.querySelector('#list_detail_options');
        if (list) {
            list.innerHTML = '';
            settings.forEach(setting => {
                list.appendChild(
                    new Option({value: setting.value}).e
                );
            });
        };
    });
};
function reset_add_detail() {
    set_value({id: 'detail_name_add'});
    set_value({id: 'detail_value_add'});
};
window.addEventListener('load', function () {
    addClickListener('reload_options', getDetailOptions)
    $('#mdl_detail_add').on('show.bs.modal', reset_add_detail);
    $('#mdl_detail_add').on('show.bs.modal', getDetailOptions);
    enable_button('detail_add');
    addFormListener(
        'detail_add',
        'POST',
        '/details',
        {
            onComplete: [,
                reset_add_detail,
                getDetails,
                function () {
                    set_value({id: 'inp_detail_name',  value: ''});
                    set_value({id: 'inp_detail_value', value: ''});
                }
            ]
        }
    );
});
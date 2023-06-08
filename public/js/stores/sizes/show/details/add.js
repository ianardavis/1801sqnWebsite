const enable_add_detail = enable_button('detail_add');
function getDetailOptions() {
    clear('list_detail_options')
    .then(list => {
        get({
            table: 'settings',
            where: {name: 'detail_option'},
            spinner: 'detail_options'
        })
        .then(function ([settings, options]) {
            settings.forEach(setting => {
                list.appendChild(
                    new Option({value: setting.value}).e
                );
            });
        });
    });
};
function reset_add_detail() {
    set_value('detail_name_add');
    set_value('detail_value_add');
};
window.addEventListener('load', function () {
    add_listener('reload_options', getDetailOptions)
    modalOnShow('detail_add', reset_add_detail);
    modalOnShow('detail_add', getDetailOptions);
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
                    set_value('inp_detail_name',);
                    set_value('inp_detail_value');
                }
            ]
        }
    );
});
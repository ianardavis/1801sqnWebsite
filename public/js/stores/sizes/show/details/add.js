const enable_add_detail = enableButton('detail_add');
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
    setValue('detail_name_add');
    setValue('detail_value_add');
};
window.addEventListener('load', function () {
    addListener('reload_options', getDetailOptions)
    modalOnShow('detail_add', reset_add_detail);
    modalOnShow('detail_add', getDetailOptions);
    enableButton('detail_add');
    addFormListener(
        'detail_add',
        'POST',
        '/details',
        {
            onComplete: [,
                reset_add_detail,
                get_details,
                function () {
                    setValue('inp_detail_name',);
                    setValue('inp_detail_value');
                }
            ]
        }
    );
});
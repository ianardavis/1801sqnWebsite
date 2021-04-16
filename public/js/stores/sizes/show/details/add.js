function getDetailOptions() {
    get(
        {
            table: 'settings',
            query: ['_name=detail_option']
        },
        function (settings, options) {
            let list = document.querySelector('#list_detail_options');
            if (list) {
                list.innerHTML = '';
                settings.forEach(setting => {
                    list.appendChild(
                        new Option({value: setting._value}).e
                    );
                });
            };
        }
    );
};
window.addEventListener('load', function () {
    getDetailOptions();
    addFormListener(
        'detail_add',
        'POST',
        '/details',
        {
            onComplete: [
                getDetails,
                function () {
                    set_value({id: 'inp_detail_name',  value: ''});
                    set_value({id: 'inp_detail_value', value: ''});
                }
            ]
        }
    );
});
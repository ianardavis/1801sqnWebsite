function getDefault() {
    get(
        function (setting, options) {
            let _default = document.querySelector('#_default');
            if (_default) {
                let _button = document.querySelector('#default_button');
                if (setting._value === path[3]) {
                    _button.setAttribute('disabled', true);
                    _default.innerText = 'Yes';
                } else {
                    _button.removeAttribute('disabled');
                    _default.innerText = 'No';
                };
            };
        },
        {
            table: 'setting',
            query: ['_name=default_supplier']
        }
    );
};
window.addEventListener("load", function () {
    addFormListener(
        'form_set_default',
        'PUT',
        '/stores/settings',
        {onComplete: getDefault}
    );
});
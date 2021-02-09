function getDefault() {
    get(
        {
            table: 'setting',
            query: ['_name=default_supplier']
        },
        function (setting, options) {
            let subtitle = document.querySelector(`#default_${setting._value}`);
            if (subtitle) subtitle.innerText = 'Default';
        }
    );
};
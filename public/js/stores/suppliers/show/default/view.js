function getDefault() {
    get(
        {
            table: 'setting',
            query: ['_name=default_supplier']
        },
        function (setting, options) {
            set_innerText({id: '_default', text: yesno((setting._value === path[3]))});
        }
    );
};
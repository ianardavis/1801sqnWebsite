function setDefaultBtn() {
    get(
        {
            table: 'setting',
            query: ['_name=default_supplier']
        },
        function (setting, options) {
            if (setting._value === path[2]) set_attribute(   {id: 'btn_default', attribute: 'disabled', value: true});
            else                            remove_attribute({id: 'btn_default', attribute: 'disabled'});
        }
    );
};
window.addEventListener("load", function () {
    addFormListener(
        'set_default',
        'PUT',
        '/stores/settings',
        {
            onComplete: [
                getDefault,
                setDefaultBtn
            ]
        }
    );
});
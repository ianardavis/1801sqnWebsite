function setDefaultBtn() {
    get({
        table: 'setting',
        query: ['name=default_supplier']
    })
    .then(function ([setting, options]) {
        if (setting.value === path[2]) disable_button('default');
        else                           enable_button('default');
    });
};
window.addEventListener("load", function () {
    addFormListener(
        'set_default',
        'PUT',
        '/suppliers/default',
        {
            onComplete: [
                getDefault,
                setDefaultBtn
            ]
        }
    );
});
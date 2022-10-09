function setDefaultBtn() {
    get({
        table: 'setting',
        where: {name: 'default_supplier'},
        spinner: 'supplier'
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
        `/suppliers/${path[2]}/default`,
        {
            onComplete: [
                getDefault,
                setDefaultBtn
            ]
        }
    );
    setDefaultBtn();
});
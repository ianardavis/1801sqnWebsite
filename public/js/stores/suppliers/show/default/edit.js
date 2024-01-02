function setDefaultBtn() {
    get({
        table: 'setting',
        where: {name: 'default_supplier'}
    })
    .then(function ([setting, options]) {
        if (setting.value === path[2]) disableButton('default');
        else                           enableButton('default');
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
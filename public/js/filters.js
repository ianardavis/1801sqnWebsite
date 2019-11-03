function filter(selected, url) {
    var filters = [];
    if (selected) {
        selected.forEach((field) => {
            var select = document.querySelector('#' + field);
            if (select.value != '') {
                filters.push(field + "=" + select.value);
            };
        });
    };
    window.location.replace(url + "?" + filters.join("&"));
};
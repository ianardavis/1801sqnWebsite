getNSNs = (size_id, line_id, cell, nsn_id = null) => {
    let _cell = document.querySelector(`#${cell}_${line_id}`);
    _cell.innerHTML = '';
    add_spinner(_cell, {id: `nsns_${line_id}`});
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response = JSON.parse(event.target.responseText);
        if (response.result) {
            let nsn_options = [{value: '', text: '... Select NSN'}];
            response.nsns.forEach(e => nsn_options.push({
                value: e.nsn_id,
                text: `${String(e.group._code).padStart(2, '0')}${String(e.classification._code).padStart(2, '0')}-${String(e.country._code).padStart(2, '0')}-${e._item_number}`,
                selected: (e.nsn_id === nsn_id),
                default: (e.nsn_id === nsn_id)
            }));
            let _nsns = new Select({
                small: true,
                name: `actions[line_id${line_id}][nsn_id]`,
                required: response.result.required,
                options: nsn_options
            }).select;
            _cell.insertBefore(_nsns, document.querySelector(`#spn_nsns_${line_id}`));
        } else {
            alert(`Error: ${response.error}`);
        };
        remove_spinner(`nsns_${line_id}`);
    });
    XHR.addEventListener("error", () => {
        remove_spinner(`nsns_${line_id}`);
        alert('Oops! Something went wrong.');
    });
    XHR.open('GET', `/stores/get/nsns?size_id=${size_id}`);
    XHR.send();
};
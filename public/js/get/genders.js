getGenders = () => {
    show_spinner('genders');
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response = JSON.parse(event.target.responseText),
            _select  = document.querySelector('#gendersSelect');
        _select.innerHTML = '';
        if (response.result) {
            _select.appendChild(_option('', ''));
            response.results.forEach(gender => _select.appendChild(_option(gender.gender_id, gender._gender)));
        } else alert('Error: ' + response.error);
        hide_spinner('genders');
    });
    XHR_send(XHR, 'genders', '/stores/get/options/genders');
};
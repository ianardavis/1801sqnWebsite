getCategories = () => {
    show_spinner('categories');
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response = JSON.parse(event.target.responseText),
            _select  = document.querySelector('#categoriesSelect');
        _select.innerHTML = '';
        if (response.result) {
            _select.appendChild(_option({value: '', text: ''}));
            response.results.forEach(category => {
                _select.appendChild(
                    _option({
                        value: category.category_id,
                        text: category._category
                    })
                )
            });
        } else alert('Error: ' + response.error);
        hide_spinner('categories');
    });
    XHR_send(XHR, 'categories', '/stores/get/options/categories');
};
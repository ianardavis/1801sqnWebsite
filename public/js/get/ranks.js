getRanks = () => {
    show_spinner('ranks');
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response = JSON.parse(event.target.responseText),
            _select  = document.querySelector('#ranksSelect');
        _select.innerHTML = '';
        if (response.result) {
            _select.appendChild(_option({value: '', text: ''}));
            response.results.forEach(rank => {
                _select.appendChild(
                    _option({
                        value: rank.rank_id,
                        text: rank._rank
                    })
                )
            });
        } else alert('Error: ' + response.error);
        hide_spinner('items');
    });
    XHR_send(XHR, 'ranks', '/stores/get/options/ranks');
};
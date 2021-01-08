function getCounts() {
    let cards = document.querySelectorAll('.card_div');
    cards.forEach(card => {
        let supplier_id = String(card.id).replace('supplier_', '');
        show_spinner('suppliers');
        const XHR = new XMLHttpRequest();
        XHR.addEventListener("load", event => {
            let response = JSON.parse(event.target.responseText);
            if (response.success) {
                let _body = document.querySelector(`#supplier_${supplier_id} .card-body p`);
                _body.innerText = `Items: ${response.count}`;
            } else alert(`Error: ${response.error}`);
            hide_spinner('suppliers');
        });
        XHR.addEventListener("error", function () {
            alert(`Something went wrong getting ${options.table}`)
            hide_spinner(options.spinner || options.table);
        });
        XHR.open(options.method || 'GET', `/stores/count/sizes?supplier_id=${supplier_id}`);
        XHR.send();
    });
};
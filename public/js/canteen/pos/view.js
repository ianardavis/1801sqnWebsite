function isShown(id) {
    let e = document.querySelector(`#${id}`);
    if (e && !e.classList.contains('hidden')) return true
    else return false;
};
function set_tendered(amt) {
    amt = String(amt).padStart(3, '0');
    amt = amt.substring(0, amt.length - 2) + "." + amt.substring(amt.length - 2);
    set_value('tendered', amt);
};

function getSale() {
    get({table: 'sale_current'})
    .then(function ([sale_id, options]) {
        if (sale_id) {
            set_innerText('sale_id', sale_id);
            document.querySelectorAll('.sale_id').forEach(e => e.setAttribute('value', sale_id));
            getSaleLines();
        } else alert_toast('Sale not found');
    });
};
function getSaleLines() {
    let sale_id = document.querySelector('#sale_id');
    if (sale_id) {
        clear('tbl_sale_lines')
        .then(tbl_sale_lines => {
            get({
                table: 'sale_lines',
                where: {sale_id: sale_id.innerText}
            })
            .then(function ([results, options]) {
                let total  = 0;
                if (results.lines.length === 0) {
                    disable_button('complete_sale')
                    disable_button('finish');
                } else {
                    enable_button('complete_sale');
                    enable_button('finish');
                    results.lines.forEach(line => {
                        total += line.qty * line.price;
                        let row = tbl_sale_lines.insertRow(-1);
                        add_cell(row, {text: line.item.name});
                        add_cell(row, {text: `£${Number(line.price).toFixed(2)}`});
                        add_cell(row, {text: line.qty});
                        add_cell(row, {text: `£${Number(line.qty * line.price).toFixed(2)}`});
                        let form = document.createElement('form');
                        form.setAttribute('id', `form_${line.sale_line_id}_minus`)
                        form.appendChild(new Hidden_Input({
                            attributes: [
                                {field: 'name', value: 'line[sale_line_id]'},
                                {field: 'value', value: line.sale_line_id}
                            ]}).e
                        );
                        form.appendChild(new Hidden_Input({
                            attributes: [
                                {field: 'name',  value: 'line[qty]'},
                                {field: 'value', value: -1}
                            ]}).e
                        );
                        form.appendChild(new Button({html: '<i class="fas fa-minus"></i>', small: true, noType: true}).e);
                        add_cell(row, {append: form});
                        addFormListener(
                            `${line.sale_line_id}_minus`,
                            'PUT',
                            `/sale_lines`,
                            {noConfirm: true, onComplete: getSaleLines}
                        );
                    });
                };
                document.querySelectorAll('.total').forEach(e => e.innerText = total.toFixed(2) || '0.00');
            });
        });
    };
};
function addSaleLine(ean) {
    console.log(ean)
    sendData(
        this,
        'POST',
        `/sale_lines/ean/${ean}`,
        {
            onComplete: getSaleLines,
            noConfirm: true
        }
    );
};
function reset_sale_complete() {
    let change = document.querySelector('#change');
    change.innerText = '';
    hide('btn_close_sale_complete');
    show('btn_sale_complete');
    set_value('tendered', '0.00')
};
function getSession() {
    get({
        table: 'sessions',
        where: {status: 1}
    })
    .then(function ([results, options]) {
        set_href('btn_session', `/sessions/${results.sessions[0].session_id}`);
    });
};

window.addEventListener('load', function () {
    addListener('reload', getSale);
    modalOnShow('sale_complete', reset_sale_complete);
    addFormListener(
        'sale_complete',
        'PUT',
        '/sales',
        {
            noConfirm: true,
            onComplete: [
                getSale,
                function (response) {
                    if (typeof getCredits === 'function') getCredits;
                    set_innerText('change', `${Number(response.change).toFixed(2)}`)
                    show('btn_close_sale_complete');
                    hide('btn_sale_complete');
                }
            ]
        }
    );
    getSession();
    StartScanning(addSaleLine);
});
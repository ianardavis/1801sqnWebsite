let loancard_statuses   = {"0": "Cancelled", "1": "Draft", "2": "Complete", "3":"Closed"};
function getLoancards() {
    clear('tbl_loancards')
    .then(tbl_loancards => {
        let sel_users = document.querySelector('#sel_users') || {value: ''},
            statuses  = document.querySelectorAll("input[type='checkbox']:checked") || [],
            query     = [];
            sort_cols = tbl_loancards.parentNode.querySelector('.sort') || null;
        if (statuses && statuses.length > 0) query.push(status_query(statuses));
        if (sel_users && sel_users.value !== "") query.push(sel_users.value);
        get({
            table: 'loancards',
            query: [query.join(',')],
            ...sort_query(sort_cols)
        })
        .then(function ([loancards, options]) {
            loancards.forEach(loancard => {
                let row = tbl_loancards.insertRow(-1);
                add_cell(row, table_date(loancard.createdAt));
                add_cell(row, {text: print_user(loancard.user_loancard)});
                add_cell(row, {text: loancard.lines.length || '0'});
                add_cell(row, {text: loancard_statuses[loancard.status]});
                add_cell(row, {append: new Link({href: `/loancards/${loancard.loancard_id}`, small: true}).e});
            });
            return tbl_loancards;
        })
        .then(tbl_loancards => filter(tbl_loancards));
    });
};
function filter(tbl_loancards) {
    if (!tbl_loancards) tbl_loancards = document.querySelector('#tbl_loancards');
    let from = new Date(document.querySelector('#createdAt_from').value).getTime() || '',
        to   = new Date(document.querySelector('#createdAt_to').value)  .getTime() || '';
        tbl_loancards.childNodes.forEach(row => {
        if (
            (!from || row.childNodes[0].dataset.sort > from) &&
            (!to   || row.childNodes[0].dataset.sort < to)
        )    row.classList.remove('hidden')
        else row.classList.add(   'hidden');
    });
};
function getUsers() {
    listUsers({
        blank: true,
        blank_text: 'All',
        append: '_loancard'
    })  
};
function ScanBarcode() {
    Html5Qrcode.getCameras().then(devices => {
        /**
         * devices would be an array of objects of type:
         * { id: "id", label: "label" }
         */
        if (devices && devices.length) {
            const html5QrCode = new Html5Qrcode("reader");
            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                formatsToSupport: [
                    Html5QrcodeSupportedFormats.CODE_128,
                    Html5QrcodeSupportedFormats.EAN_8,
                    Html5QrcodeSupportedFormats.EAN_13
                ]
            };
            // If you want to prefer back camera
            html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText, decodedResult) => {
                    window.location.assign(`/loancards/${decodedText}`)
                    // do something when code is read
                },
                errorMessage => {
                    // alert(errorMessage);
                    // parse error, ignore it.
                }
            );
        }
    }).catch(err => {
    // handle err
        console.log(err);
    });
};
addReloadListener(getLoancards);
window.addEventListener('load', function () {
    modalOnShow('loancard_open', ScanBarcode);
    getUsers();
    addListener('reload_users', getUsers);
    addListener('status_0',     getLoancards, 'change');
    addListener('status_1',     getLoancards, 'change');
    addListener('status_2',     getLoancards, 'change');
    addListener('status_3',     getLoancards, 'change');
    addListener('sel_users',    getLoancards, 'change');
    addListener('createdAt_from', function (){filter()}, 'change');
    addListener('createdAt_to',   function (){filter()}, 'change');
    getLoancards();
});
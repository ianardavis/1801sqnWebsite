function getNSNs() {
    get(
        {
            table: 'nsns',
            query: [`size_id=${path[2]}`]
        },
        function (nsns, options) {
            set_count({id: 'nsn', count: nsns.length || '0'});
            let tbl_nsns = document.querySelector('#tbl_nsns');
            if (tbl_nsns) {
                tbl_nsns.innerHTML = '';
                nsns.forEach(nsn => {
                    try {
                        let row = tbl_nsns.insertRow(-1);
                        add_cell(row, {text: print_nsn(nsn)});
                        if (nsn.size.nsn_id === nsn.nsn_id) add_cell(row, {html: '<i class="fas fa-check"></i>'});
                        else                                add_cell(row);
                        add_cell(row, {
                            append: new Link({
                                data:  {field: 'nsn_id', value: nsn.nsn_id},
                                modal: 'nsn_view',
                                small: true
                            }).e}
                        );
                    } catch (error) {console.log(error)};
                });
            };
        }
    );
};
function viewNSN(event) {
    get(
        {
            table: 'nsn',
            query: [`nsn_id=${event.relatedTarget.dataset.nsn_id}`],
            spinner: 'nsn_view'
        },
        function(nsn, options) {
            set_innerText({id: 'nsn_group_id',          text: `${String(nsn.group._code).padStart(2, '0')} | ${nsn.group._group}`});
            set_innerText({id: 'nsn_class_id', text: `${String(nsn.classification._code).padStart(2, '0')} | ${nsn.classification._classification}`});
            set_innerText({id: 'nsn_country_id',        text: `${String(nsn.country._code).padStart(2, '0')} | ${nsn.country._country}`});
            set_innerText({id: '_item_number',          text: nsn._item_number});
            set_innerText({id: 'nsn_id',                text: nsn.nsn_id});
            set_innerText({id: '_nsn_view',             text: print_nsn(nsn)});
            set_innerText({id: '_default',              text: yesno((nsn.nsn_id === nsn.size.nsn_id))});
            set_attribute({id: 'btn_nsn_link',          attribute: 'href', value: `/nsns/${nsn.nsn_id}`});
        }
    );
};
window.addEventListener('load', function() {
    $('#mdl_nsn_view').on('show.bs.modal', viewNSN);
    document.querySelector('#reload').addEventListener('click', getNSNs);
});
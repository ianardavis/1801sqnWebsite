function listNSNs(line_id, size) {
    get(
        function (nsns, options) {
            let sel_nsn = document.querySelector(`#sel_nsn_${line_id}`);
            if (sel_nsn) {
                sel_nsn.innerHTML = '';
                nsns.forEach(nsn => {
                    sel_nsn.appendChild(new Option({
                        text: print_nsn(nsn),
                        value: nsn.nsn_id,
                        selected: (nsn.nsn_id === size.nsn_id)
                    }).e)
                });
            };
        },
        {
            table: 'nsns',
            query: [`size_id=${size.size_id}`]
        }
    )
};
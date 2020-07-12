showNSNs = (nsns, options) => {
    try {
        let table_body = document.querySelector('#nsnTable'),
            nsn_count = document.querySelector('#nsn_count');
        nsn_count.innerText = nsns.length || '0';
        table_body.innerHTML = '';
        nsns.forEach(nsn => {
            let row = table_body.insertRow(-1);
            add_cell(row, {text: nsn._nsn});
            if (nsn.nsn_id === options.default) add_cell(row, {html: _check()})
            else add_cell(row);
            add_cell(row, {append: new Link({
                href: `javascript:show("nsns",${nsn.nsn_id})`,
                small: true}).link});
        });
        hide_spinner('nsns');
    } catch (error) {
        console.log(error);
    };
};
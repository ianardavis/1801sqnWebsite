showSerials = (serials, options) => {
    try {
        clearElement('serialTable');
        let table_body   = document.querySelector('#serialTable'),
            serial_count = document.querySelector('#serial_count');
        serial_count.innerText = serials.length || '0';
        serials.forEach(serial => {
            let row = table_body.insertRow(-1);
            add_cell(row, {text: serial._serial});
            add_cell(row, {text: serial.location._location});
            add_cell(row, {append: new Link({
                href: `javascript:show("serials",${serial.serial_id})`,
                small: true}).e});
        });
        hide_spinner('serials');
    } catch (error) {
        console.log(error);
    };
};
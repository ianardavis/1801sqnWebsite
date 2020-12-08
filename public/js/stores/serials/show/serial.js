showSerial = (serials, options) => {
    if (serials.length === 1) {
        for (let [id, value] of Object.entries(serials[0])) {
            try {
                if (id === 'location') {
                    let element = document.querySelector('#_location');
                    element.innerText = value._location;
                } else {
                    let element = document.querySelector('#' + id);
                    if (element) element.innerText = value;
                };
            } catch (error) {console.log(error)};
        };
        let _edit = document.querySelector('#edit_link');
        if (_edit) _edit.href = `javascript:edit("serials",${serials[0].serial_id})`;
    } else alert(`${serials.length} matching serials found`);
}
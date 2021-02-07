function listSerials(line_id, size) {
    get(
        {
            table: 'serials',
            query: [`size_id=${size.size_id}`]
        },
        function (serials, options) {
            let sel_serial = document.querySelector(`#sel_serial_${line_id}`);
            if (sel_serial) {
                sel_serial.innerHTML = '';
                serials.forEach(serial => {
                    if (serial.location) {
                        sel_serial.appendChild(
                            new Option({
                                text: `${serial._serial} | Location: ${serial.location._location}`,
                                value: serial.serial_id
                            }).e
                        );
                    };
                });
            };
        }
    );
};
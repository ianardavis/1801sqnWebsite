function listSerials(line_id, size) {
    clear(`sel_serial_${line_id}`)
    .then(sel_serials => {
        get({
            table: 'serials',
            where: {size_id: size.size_id}
        })
        .then(function ([serials, options]) {
            serials.forEach(serial => {
                if (serial.location) {
                    sel_serials.appendChild(
                        new Option({
                            text: `${serial._serial} | Location: ${serial.location._location}`,
                            value: serial.serial_id
                        }).e
                    );
                };
            });
        });
    });
};
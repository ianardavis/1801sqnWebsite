function getSerials(size_id, line_id, cell, entry = false) {
    let _cell = document.querySelector(`#${cell}_${line_id}`);
    add_spinner(_cell, {id: `serials_${line_id}`});
    get(
        {
            table: 'serials',
            query: [`size_id=${size_id}`]
        },
        function (serials, options) {
            let _serials = [{value: '', text:  '... Select Serial #'}];
            serials.forEach(e => _serials.push({value: e.serial_id, text: e._serial}));
            _cell.appendChild(
                new Select({
                    attributes: [
                        {field: 'name',     value: `actions[${line_id}][serial_id]`},
                        {field: 'required', value: (entry === false)}
                    ],
                    small: true,
                    options: _serials
                }).e
            );
            if (entry === true) {
                _cell.appendChild(
                    new Input({
                        attributes: [
                            {field: 'name',        value: `actions[${line_id}][serial]`},
                            {field: 'placeholder', value: 'Enter Serial #'}
                        ],
                        small: true
                    }).e
                );
            };
            remove_spinner(`serials_${line_id}`);
        }
    );
};
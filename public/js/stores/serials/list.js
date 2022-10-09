function getSerials(size_id, line_id, cell, entry = false) {
    let _cell = document.querySelector(`#${cell}_${line_id}`);
    _cell.appendChild(new Spinner(`serials_${line_id}`).e);
    get({
        table: 'serials',
        where: {size_id: size_id}
    })
    .then(function ([serials, options]) {
        let _serials = [{value: '', text:  '... Select Serial #'}];
        serials.forEach(e => _serials.push({value: e.serial_id, text: e._serial}));
        _cell.appendChild(
            new Select({
                attributes: [
                    {field: 'name',     value: `actions[${line_id}][serial_id]`},
                    {field: 'required', value: (entry === false)}
                ],
                options: _serials
            }).e
        );
        if (entry === true) {
            _cell.appendChild(
                new Text_Input({
                    attributes: [
                        {field: 'name',        value: `actions[${line_id}][serial]`},
                        {field: 'placeholder', value: 'Enter Serial #'}
                    ]
                }).e
            );
        };
        remove_spinner(`serials_${line_id}`);
    });
};
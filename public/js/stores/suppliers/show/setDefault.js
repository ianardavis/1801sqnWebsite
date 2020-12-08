setDefault = results => {
    if (results.length === 1) {
        let _default = document.querySelector('#_default');
        if (_default) {
            let _button = document.querySelector('#default_button');
            if (results[0]._value === path[3]) {
                _button.setAttribute('disabled', true);
                _default.innerText = 'Yes';
            } else {
                _button.removeAttribute('disabled');
                _default.innerText = 'No';
            };
        };
    } else {
        alert(`Error: ${results.length} default suppliers found`);
    };
};
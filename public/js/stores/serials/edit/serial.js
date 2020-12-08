showSerial = (serials, options) => {
    if (serials.length === 1) {
        console.log(serials[0])
        for (let [id, value] of Object.entries(serials[0])) {
            try {
                if (id === 'location') {
                    let element = document.querySelector('#_location');
                    element.value = value._location;
                } else {
                    let element = document.querySelector('#' + id);
                    if (element) element.value = value;
                };
            } catch (error) {console.log(error)};
        };
    } else alert(`${serials.length} matching serials found`);
}
module.exports = {
    create: (options = {}) => new Promise((resolve, reject) => {
        if (
            options.location &&
            (
                (options.location.location_id && options.location.location_id !== '') ||
                (options.location._location   && options.location._location !== '')
            ) &&
            options.serial &&
            options.size_id &&
            options.m &&
            options.m.locations &&
            options.m.serials &&
            options.m.sizes
        ) {
            return options.m.sizes.findOne({
                where: {size_id: options.size_id},
                attributes: ['size_id']
            })
            .then(size => {
                if (!size) {
                    resolve({
                        success: false,
                        message: 'Size not found'
                    });
                } else if (!size._serials) {
                    resolve({
                        success: false,
                        message: 'This size does not have serials'
                    });
                } else {
                    let get_location = null;
                    if (options.location.location_id && options.location.location_id !== '') {
                        get_location = options.m.locations.findOne({
                            where: {location_id: options.location.location_id},
                            attributes: ['location_id']
                        })
                    } else if (options.location._location && options.location._location !== '') {
                        get_location = options.m.locations.findOrCreate({
                            where: {_location: options.location._location}
                        })
                    } else {
                        resolve({
                            success: false,
                            message: 'No location or location ID specified'
                        });
                    };
                    return get_location()
                    .then(([location, created]) => {
                        if (location) {
                            return options.m.serials.findOrCreate({
                                where: {
                                    size_id: size.size_id,
                                    _serial: options.serial
                                },
                                defaults: {
                                    location_id: location.location_id
                                }
                            })
                            .then(([serial, created]) => {
                                if (created) {
                                    resolve({
                                        success: false,
                                        message: 'Serial already exists',
                                        serial_id: serial.serial_id
                                    });
                                } else {
                                    resolve({
                                        success: true,
                                        serial_id: serial.serial_id
                                    });
                                };
                            })
                            .catch(err => reject(err));
                        } else {
                            resolve({
                                success: false,
                                message: 'Location not found/could not create location'
                            });
                        };
                    })
                    .catch(err => reject(err));
                    
                };
            })
            .catch(err => reject(err));
        } else {
            resolve({
                success: false,
                message: 'Not all required fields have been submitted'
            });
        };
    })
};
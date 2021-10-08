module.exports = function (m, fn) {
    fn.serials = {};
    fn.serials.create = function (options = {}) {
        return new Promise((resolve, reject) => {
            if (options.serial && options.size_id) {
                return fn.get(
                    'sizes',
                    {size_id: options.size_id}
                )
                .then(size => {
                    if (!size.has_serials) resolve({success: false, message: 'This size does not have serials'});
                    else {
                        return m.serials.findOrCreate({
                            where: {
                                size_id: size.size_id,
                                serial:  options.serial
                            }
                        })
                        .then(([serial, created]) => {
                            if (created) resolve({success: true, message: 'Serial created', serial_id: serial.serial_id});
                            else if (
                                (!serial.location_id   || String(serial.location_id).trim() === '') && 
                                (!serial.issue_line_id || String(serial.issue_line_id).trim() === '')
                            )    resolve({success: true,  message: 'Serial exists, not issued or in stock', serial_id: serial.serial_id});
                            else resolve({success: false, message: 'Serial exists, issued or in stock', serial_id: serial.serial_id});
                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            } else resolve({success: false, message: 'Not all required fields have been submitted'});
        });
    };
    fn.serials.return_to_stock = function (serial_id, location_id) {
        return new Promise((resolve, reject) => {
            return fn.get(
                'serials',
                {serial_id: serial_id}
            )
            .then(serial => {
                if      (!serial.issue_id)   reject(new Error('Serial # not issued'))
                else if (serial.location_id) reject(new Error('Serial # already in stock'))
                else {
                    return fn.update(serial, {
                        location_id: location_id,
                        issue_id:    null
                    })
                    .then(result => resolve([serial]))
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.serials.receive = function (options = {}) {
        return new Promise((resolve, reject) => {
            return fn.locations.get({location: options.location})
            .then(location_id => {
                return m.serials.findOrCreate({
                    where: {
                        size_id: options.size_id,
                        serial:  options.serial
                    },
                    defaults: {
                        location_id: location_id
                    }
                })
                .then(([serial, created]) => {
                    let actions = [];
                    if (!created) {
                        actions.push(
                            new Promise((resolve, reject) => {
                                if (serial.location_id || serial.issue_id) reject(new Error('This serial number already exists and is already in stock or currently issued'))
                                else {
                                    return fn.update(serial, {location_id: location_id})
                                    .then(result => resolve(true))
                                    .catch(err => reject(err));
                                };
                            })
                        );
                    };
                    return Promise.all(actions)
                    .then(result => {
                        return fn.actions.create({
                            action:  'RECEIVED',
                            user_id: options.user_id,
                            links: [
                                {table: 'locations', id: location_id},
                                {table: 'serials',   id: serial.serial_id}
                            ].concat(options.links || [])
                        })
                        .then(action => resolve(true))
                        .catch(err => {
                            console.log(err);
                            resolve(false);
                        });
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};
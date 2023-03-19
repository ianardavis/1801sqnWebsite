module.exports = function (m, fn) {
    fn.serials = {};
    fn.serials.get = function (where) {
        return fn.get(
            m.serials,
            where,
            [
                fn.inc.stores.location(),
                fn.inc.stores.issue(),
                fn.inc.stores.size()
            ]
        )
    };
    fn.serials.get_all = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.serials.findAndCountAll({
                where:   where,
                include: [
                    fn.inc.stores.location(),
                    fn.inc.stores.issue(),
                    fn.inc.stores.size()
                ],
                ...pagination
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
        });
    };

    fn.serials.edit = function (serial_id, new_serial, user_id) {
        return new Promise((resolve, reject) => {
            fn.serials.get({serial_id: serial_id})
            .then(serial => {
                let original_serial = serial.serial;
                serial.update({serial: new_serial})
                .then(result => {
                    if (result) {
                        fn.actions.create([
                            `EDITED | Serial changed from ${original_serial} to ${new_serial}`,
                            user_id,
                            [{_table: 'serials', id: serial.serial_id}]
                        ])
                        .then(result => resolve(true));
                    } else {
                        reject(new Error('serial not updated'));
                    };
                })
                .catch(err => reject(err));
            })
        .catch(err => reject(err));
        });
    };
    fn.serials.transfer = function (serial_id, location, user_id) {
        return new Promise((resolve, reject) => {
            if (location) {
                fn.serials.get({serial_id: serial_id})
                .then(serial => {
                    let original_location = serial.location.location;
                    fn.locations.find_or_create({location: location})
                    .then(new_location => {
                        if (new_location.location_id !== serial.location_id) {
                            serial.update({location_id: new_location.location_id})
                            .then(result => {
                                if (result) {
                                    fn.actions.create([
                                        `SERIAL | LOCATION | transferred from ${original_location} to ${new_location.location}`,
                                        user_id,
                                        [{_table: 'serials', id: serial.serial_id}]
                                    ])
                                    .then(result => resolve(true));
                                } else {
                                    reject(new Error('Serial not updated'));
                                };
                            })
                            .catch(err => reject(err));
                        } else {
                            reject(new Error('From and to locations are the same'));
                        };
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            } else {
                reject(new Error('No location specified'));
            };
        });
    };

    fn.serials.scrap = function (serial_id, details, user_id) {
        function scrap_check(serial, details) {
            return new Promise((resolve, reject) => {
                if (serial.size.has_nsns && !details.nsn_id) {
                    reject(new Error("No valid NSN submitted"));

                } else if (!serial.location_id) {
                    reject(new Error("Serial is not in stock"));

                } else if (serial.issue_id) {
                    reject(new Error("Serial is currently issued"));

                } else if (!serial.location) {
                    reject(new Error("Invalid serial location"));

                } else {
                    resolve(true);

                };
            });
        };
        return new Promise((resolve, reject) => {
            if (details) {
                fn.serials.get({serial_id: serial_id})
                .then(serial => {
                    scrap_check(serial, details)
                    .then(result => {
                        serial.update({location_id: null})
                        .then(result => {
                            fn.scraps.get_or_create(serial.size.supplier_id)
                            .then(scrap => {
                                fn.scraps.lines.create(
                                    scrap.scrap_id,
                                    serial.size_id,
                                    details
                                )
                                .then(result => {
                                    fn.actions.create([
                                        'SERIAL | SCRAPPED',
                                        user_id,
                                        [{_table: 'serials', id: serial.serial_id}]
                                    ])
                                    .then(results => resolve(true));
                                })
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
                
            } else {
                reject(new Error('No details submitted'));

            };
        });
    };
    fn.serials.create = function (serial, size_id, user_id) {
        return new Promise((resolve, reject) => {
            if (serial && size_id) {
                fn.sizes.get({size_id: size_id})
                .then(size => {
                    if (!size.has_serials) {
                        reject(new Error('This size does not have serials'));

                    } else {
                        m.serials.findOrCreate({
                            where: {
                                size_id: size.size_id,
                                serial:  serial
                            }
                        })
                        .then(([serial, created]) => {
                            if (created) {
                                fn.actions.create([
                                    'CREATED',
                                    user_id,
                                    [{_table: 'serials', id: serial.serial_id}]
                                ])
                                .then(result => resolve(serial));

                            } else {
                                reject(new Error('Serial already exists'));

                            };
                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));

            } else {
                reject(new Error('Not all required fields have been submitted'));
                
            };
        });
    };
    fn.serials.return = function (serial_id, location) {
        return new Promise((resolve, reject) => {
            fn.serials.get({serial_id: serial_id})
            .then(serial => {
                if (!serial.issue_id) {
                    reject(new Error('Serial # not issued'));

                } else if (serial.location_id) {
                    reject(new Error('Serial # already in stock'));

                } else {
                    m.locations.findOrCreate({
                        where: {location: location}
                    })
                    .then(([location, created]) => {
                        serial.update({
                            location_id: location.location_id,
                            issue_id:    null
                        })
                        .then(result => resolve({_table: 'serials', id: serial.serial_id}))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));

                };
            })
            .catch(err => reject(err));
        });
    };
    fn.serials.receive = function (location, serial, size_id, user_id) {
        return new Promise((resolve, reject) => {
            if (location && serial && size_id && user_id) {
                fn.serials.create(serial, size_id, user_id)
                .then(serial => {
                    fn.serials.set_location(
                        serial, 
                        location, 
                        user_id, 
                        'on receipt'
                    )
                    .then(result => resolve({serial_id: serial.serial_id, location_id: location.location_id}))
                    .catch(err => {
                        console.log(err);
                        resolve({serial_id: serial.serial_id});
                    });
                })
                .catch(err => reject(err));
            } else {
                reject(new Error('Not all details present'));
            };
        });
    };
    fn.serials.set_location = function (serial, location, user_id, action_append = '') {
        return new Promise((resolve, reject) => {
            fn.locations.find_or_create(location)
            .then(location => {
                serial.update({location_id: location.location_id})
                .then(result => {
                    if (result) {
                        fn.actions.create([
                            `SERIAL | LOCATION | Set to ${location.location}${action_append}`,
                            user_id,
                            [{_table: 'serials', id: serial.serial_id}]
                        ])
                        .then(result => resolve(true));

                    } else {
                        reject(new Error('Serial location not updated'));

                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    fn.serials.delete = function (serial_id) {
        return new Promise((resolve, reject) => {
            Promise.all([
                fn.serials.get({serial_id: serial_id}),
                m.actions.findOne({where: {serial_id: serial.serial_id}}),
                m.loancard_lines.findOne({where: {serial_id: serial.serial_id}})
            ])
            .then(([serial, action, line]) => {
                if (action) {
                    reject(new Error('Cannot delete a serial with actions'));
                    
                } else if (line) {
                    reject(new Error('Cannot delete a serial with loancards'));
                            
                } else {   
                    serial.destroy()
                    .then(result => {
                        if (result) {
                            resolve(true);
                            
                        } else {
                            reject(new Error('Serial not deleted'));
                            
                        };
                    })
                    .catch(err => reject(err));
                    
                };
            })
            .catch(err => reject(err));
        });
    };
};
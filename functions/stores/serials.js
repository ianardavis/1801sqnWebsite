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
            .catch(reject);
        });
    };

    fn.serials.edit = function (serial_id, new_serial, user_id) {
        return new Promise((resolve, reject) => {
            fn.serials.get({serial_id: serial_id})
            .then(serial => {
                let original_serial = serial.serial;
                fn.update(serial, {serial: new_serial})
                .then(result => {
                    fn.actions.create([
                        `EDITED | Serial # changed from ${original_serial} to ${new_serial}`,
                        user_id,
                        [{_table: 'serials', id: serial.serial_id}]
                    ])
                    .then(result => resolve(true));

                })
                .catch(reject);
            })
        .catch(reject);
        });
    };
    fn.serials.transfer = function (serial_id, location, user_id) {
        if (location) {
            return new Promise((resolve, reject) => {
                fn.serials.get({serial_id: serial_id})
                .then(serial => {
                    let original_location = serial.location.location;
                    fn.locations.find_or_create(location)
                    .then(new_location => {
                        if (new_location.location_id !== serial.location_id) {
                            fn.update(
                                serial,
                                {location_id: new_location.location_id},
                                [
                                    `SERIAL | LOCATION | transferred from ${original_location} to ${new_location.location}`,
                                    user_id,
                                    [{_table: 'serials', id: serial.serial_id}]
                                ]
                            )
                            .then(fn.actions.create)
                            .then(action => resolve(true))
                            .catch(reject);

                        } else {
                            reject(new Error('From and to locations are the same'));

                        };
                    })
                    .catch(reject);
                })
                .catch(reject);
            });
            
        } else {
            return Promise.reject(new Error('No location specified'));
            
        };
    };

    fn.serials.scrap = function (serial_id, details, user_id) {
        if (details) {
            function check_serial() {
                return new Promise((resolve, reject) => {
                    fn.serials.get({serial_id: serial_id})
                    .then(serial => {
                        if (serial.size.has_nsns && !details.nsn_id) {
                            reject(new Error("No valid NSN submitted"));
    
                        } else if (!serial.location_id) {
                            reject(new Error("Serial is not in stock"));
    
                        } else if (serial.issue_id) {
                            reject(new Error("Serial is currently issued"));
    
                        } else if (!serial.location) {
                            reject(new Error("Invalid serial location"));
    
                        } else {
                            resolve(serial);
    
                        };
                    })
                    .catch(reject);
                });
            };
            return new Promise((resolve, reject) => {
                check_serial()
                .then(serial => {
                    fn.update(serial, {location_id: null}, serial.size.supplier_id)
                    .then(fn.scraps.get_or_create)
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
                        .catch(reject);
                    })
                    .catch(reject);
                })
                .catch(reject);
            });

        } else {
            return Promise.reject(new Error('No details submitted'));

        };
    };
    fn.serials.create = function (serial, size_id, user_id) {
        function check_size() {
            return new Promise((resolve, reject) => {
                fn.sizes.get({size_id: size_id})
                .then(size => {
                    if (!size.has_serials) {
                        reject(new Error('This size does not have serials'));

                    } else {
                        resolve(size.size_id);

                    };
                })
                .catch(reject);
            });
        };
        function create_serial(size_id) {
            return new Promise((resolve, reject) => {
                m.serials.findOrCreate({
                    where: {
                        size_id: size_id,
                        serial:  serial
                    }
                })
                .then(([serial, created]) => {
                    if (created) {
                        resolve([
                            'SERIAL | CREATED',
                            user_id,
                            [{_table: 'serials', id: serial.serial_id}],
                            serial
                        ]);

                    } else {
                        reject(new Error('Serial already exists'));

                    };
                })
                .catch(reject);
            });
        };
        if (serial && size_id) {
            return new Promise((resolve, reject) => {
                check_size()
                .then(create_serial)
                .then(fn.actions.create)
                .then(resolve)
                .catch(reject);
            });

        } else {
            return Promise.reject(new Error('Not all required fields have been submitted'));
            
        };
    };
    fn.serials.return = function (serial_id, location) {
        function check_serial() {
            return new Promise((resolve, reject) => {
                fn.serials.get({serial_id: serial_id})
                .then(serial => {
                    if (!serial.issue_id) {
                        reject(new Error('Serial # not issued'));
    
                    } else if (serial.location_id) {
                        reject(new Error('Serial # already in stock'));
    
                    } else {
                        resolve(serial);
    
                    };
                })
                .catch(reject);
            });
        };
        return new Promise((resolve, reject) => {
            check_serial()
            .then(serial => {
                m.locations.findOrCreate({
                    where: {location: location}
                })
                .then(([location, created]) => {
                    fn.update(
                        serial,
                        {
                            location_id: location.location_id,
                            issue_id:    null
                        }
                    )
                    .then(result => resolve({_table: 'serials', id: serial.serial_id}))
                    .catch(reject);
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };
    fn.serials.receive = function (location, serial, size_id, user_id) {
        if (location && serial && size_id && user_id) {
            return new Promise((resolve, reject) => {
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
                        console.error(err);
                        resolve({serial_id: serial.serial_id});
                    });
                })
                .catch(reject);
            });

        } else {
            return Promise.reject(new Error('Not all details present'));

        };
    };
    fn.serials.set_location = function (serial, location, user_id, action_append = '') {
        return new Promise((resolve, reject) => {
            fn.locations.find_or_create(location)
            .then(location => {
                fn.update(
                    serial,
                    {location_id: location.location_id},
                    [
                        `SERIAL | LOCATION | Set to ${location.location}${action_append}`,
                        user_id,
                        [{_table: 'serials', id: serial.serial_id}]
                    ]
                )
                .then(fn.actions.create)
                .then(result => resolve(true))
                .catch(reject);
            })
            .catch(reject);
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
                    fn.destroy(serial)
                    .then(resolve)
                    .catch(reject);
                    
                };
            })
            .catch(reject);
        });
    };
};
module.exports = function ( m, fn ) {
    fn.serials = {};
    fn.serials.find = function (where) {
        return fn.find(
            m.serials,
            where,
            [
                fn.inc.stores.location(),
                fn.inc.stores.issue(),
                fn.inc.stores.size()
            ]
        )
    };
    fn.serials.findAll = function ( query ) {
        return m.serials.findAndCountAll({
            where: query.where,
            include: [
                fn.inc.stores.location(),
                fn.inc.stores.issue(),
                fn.inc.stores.size()
            ],
            ...fn.pagination( query )
        });
    };

    fn.serials.edit = function (serial_id, new_serial, user_id) {
        return new Promise( ( resolve, reject ) => {
            fn.serials.find({serial_id: serial_id})
            .then(serial => {
                let original_serial = serial.serial;
                serial.update( { serial: new_serial } )
                .then( fn.checkResult )
                .then(result => {
                    fn.actions.create([
                        `EDITED | Serial # changed from ${original_serial} to ${new_serial}`,
                        user_id,
                        [{_table: 'serials', id: serial.serial_id}]
                    ])
                    .then(result => resolve(true));

                })
                .catch( reject );
            })
        .catch( reject );
        });
    };
    fn.serials.transfer = function (serial_id, location, user_id) {
        if (location) {
            return new Promise( ( resolve, reject ) => {
                fn.serials.find({serial_id: serial_id})
                .then(serial => {
                    let original_location = serial.location.location;
                    fn.locations.findOrCreate(location)
                    .then(new_location => {
                        if (new_location.location_id !== serial.location_id) {
                            serial.update( { location_id: new_location.location_id } )
                            .then( result => {
                                fn.actions.create([
                                    `SERIAL | LOCATION | transferred from ${original_location} to ${new_location.location}`,
                                    user_id,
                                    [ { _table: 'serials', id: serial.serial_id } ]
                                ])
                                .then(action => resolve(true))
                                .catch( reject );
                            })
                            .then(fn.actions.create)
                            .then(action => resolve(true))
                            .catch( reject );

                        } else {
                            reject(new Error('From and to locations are the same'));

                        };
                    })
                    .catch( reject );
                })
                .catch( reject );
            });
            
        } else {
            return Promise.reject(new Error('No location specified'));
            
        };
    };

    fn.serials.scrap = function (serial_id, details, user_id) {
        if (details) {
            function checkSerial() {
                return new Promise( ( resolve, reject ) => {
                    fn.serials.find({serial_id: serial_id})
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
                    .catch( reject );
                });
            };
            return new Promise( ( resolve, reject ) => {
                checkSerial()
                .then(serial => {
                    serial.update( { location_id: null } )
                    .then(result => {
                        fn.scraps.findOrCreate( serial.size.supplier_id )
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
                            .catch( reject );
                        })
                        .catch( reject );
                    })
                    .catch( reject );
                })
                .catch( reject );
            });

        } else {
            return Promise.reject(new Error('No details submitted'));

        };
    };
    fn.serials.create = function (serial, size_id, user_id) {
        function checkSize() {
            return new Promise( ( resolve, reject ) => {
                fn.sizes.find({size_id: size_id})
                .then(size => {
                    if (!size.has_serials) {
                        reject(new Error('This size does not have serials'));

                    } else {
                        resolve(size.size_id);

                    };
                })
                .catch( reject );
            });
        };
        function createSerial(size_id) {
            return new Promise( ( resolve, reject ) => {
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
                .catch( reject );
            });
        };
        if (serial && size_id) {
            return new Promise( ( resolve, reject ) => {
                checkSize()
                .then(createSerial)
                .then(fn.actions.create)
                .then(resolve)
                .catch( reject );
            });

        } else {
            return Promise.reject(new Error('Not all required fields have been submitted'));
            
        };
    };
    fn.serials.return = function (serial_id, location) {
        function checkSerial() {
            return new Promise( ( resolve, reject ) => {
                fn.serials.find({serial_id: serial_id})
                .then(serial => {
                    if (!serial.issue_id) {
                        reject(new Error('Serial # not issued'));
    
                    } else if (serial.location_id) {
                        reject(new Error('Serial # already in stock'));
    
                    } else {
                        resolve(serial);
    
                    };
                })
                .catch( reject );
            });
        };
        return new Promise( ( resolve, reject ) => {
            checkSerial()
            .then(serial => {
                m.locations.findOrCreate({
                    where: {location: location}
                })
                .then(([location, created]) => {
                    serial.update({
                        location_id: location.location_id,
                        issue_id:    null
                    })
                    .then( fn.checkResult )
                    .then(result => resolve({_table: 'serials', id: serial.serial_id}))
                    .catch( reject );
                })
                .catch( reject );
            })
            .catch( reject );
        });
    };
    fn.serials.receive = function (location, serial, size_id, user_id) {
        if (location && serial && size_id && user_id) {
            return new Promise( ( resolve, reject ) => {
                fn.serials.create(serial, size_id, user_id)
                .then(serial => {
                    fn.serials.setLocation(
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
                .catch( reject );
            });

        } else {
            return Promise.reject(new Error('Not all details present'));

        };
    };
    fn.serials.setLocation = function (serial, location, user_id, action_append = '') {
        return new Promise( ( resolve, reject ) => {
            fn.locations.findOrCreate(location)
            .then(location => {
                serial.update( { location_id: location.location_id},
                    
                )
                .then( fn.checkResult )
                .then( result => {
                    fn.actions.create([
                        `SERIAL | LOCATION | Set to ${location.location}${action_append}`,
                        user_id,
                        [ { _table: 'serials', id: serial.serial_id } ]
                    ])
                    .then(result => resolve(true))
                    .catch( reject );
                })
                .catch( reject );
            })
            .catch( reject );
        });
    };

    fn.serials.delete = function (serial_id) {
        return new Promise( ( resolve, reject ) => {
            Promise.all([
                fn.serials.find({serial_id: serial_id}),
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
                    .then( fn.checkResult )
                    .then(resolve)
                    .catch( reject );
                    
                };
            })
            .catch( reject );
        });
    };
};
// const locations = require("./locations");
var serials   = require(process.env.ROOT + '/fn/stores/serials'),
    locations = require(process.env.ROOT + '/fn/stores/locations');
function serial_details_present(serial) {
    return  serial.serial          &&
            (serial.serial !== '') && 
            (
                (serial.location    && (String(serial.location).trim()    !== '')) || 
                (serial.location_id && (String(serial.location_id).trim() !== ''))
            );
};
module.exports = {
    create: (options = {}) => new Promise((resolve, reject) => {
        if ( //Check all required fields are present
            !options.m                                || 
            !options.m.suppliers                      ||
            !options.m.receipts                       ||
            !options.supplier_id                      ||
            String(options.supplier_id).trim() === '' ||
            !options.user_id                          ||
            String(options.user_id).trim() === ''
        ) {
            resolve({
                success: false,
                message: 'Required fields are missing'
            });
        } else {
            return options.m.suppliers.findOne({ //Get requested supplier
                where: {supplier_id: options.supplier_id},
                attributes: ['supplier_id']
            })
            .then(supplier => {
                if (!supplier) { //Check supplier exists
                    resolve({
                        success: false,
                        message: 'Supplier not found'
                    });
                } else {
                    return options.m.receipts.findOrCreate({ //Find or create receipt
                        where: {
                            supplier_id: supplier.supplier_id,
                            _status: 1
                        },
                        defaults: {user_id: options.user_id}
                    })
                    .then(([receipt, created]) => {
                        let message = '';
                        if (created) message = 'Receipt created'
                        else message = 'Draft receipt found';
                        resolve({
                            success: true,
                            message: message,
                            receipt: {
                                receipt_id: receipt.receipt_id,
                                created: created
                            }
                        });
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));

        };
    }),
    createLine: (options = {}) => new Promise((resolve, reject) => {
        if (
            !options.m               ||
            !options.m.sizes         ||
            !options.m.receipts      ||
            !options.m.receipt_lines ||
            !options.m.locations     ||
            !options.m.serials
        ) {
            resolve({
                success: false,
                message: 'Required fields are missing'
            });
        } else {
            ['size_id', 'receipt_id', 'user_id', '_qty'].forEach(e => {
                if (!options[e] || String(options[e]).trim() === '') {
                    resolve({
                        success: false,
                        message: `Required fields missing: ${e}`
                    });
                };
            });
            return options.m.sizes.findOne({
                where: {size_id: options.size_id},
                attributes: ['size_id', 'supplier_id', '_serials']
            })
            .then(size => {
                if (!size) {
                    resolve({
                        success: false,
                        message: 'Size not found'
                    });
                } else if (!size.supplier_id || String(size.supplier_id).trim() === '') {
                    resolve({
                        success: false,
                        message: 'Size does not have a supplier specified'
                    });
                } else {
                    return options.m.receipts.findOne({
                        where: {receipt_id: options.receipt_id},
                        attributes: ['receipt_id', 'supplier_id', '_status']
                    })
                    .then(receipt => {
                        if (!receipt) {
                            resolve({
                                success: false,
                                message: 'Receipt not found'
                            });
                        } else if (receipt._status !== 1) {
                            resolve({
                                success: false,
                                message: 'Lines can only be added to draft receipts'
                            });
                        } else if (size.supplier_id !== receipt.supplier_id) {
                            resolve({
                                success: false,
                                message: 'Size is not from this supplier'
                            });
                        } else {
                            let actions = [];
                            if (size._serials) {
                                options.serials_clean = [];
                                if (Array.isArray(options.serials) === false) {
                                    resolve({
                                        success: false,
                                        message: 'Serial # not submitted'
                                    });
                                } else {
                                    options.serials_clean = options.serials.filter(serial_details_present)
                                    if (options.serials_clean.length < Number(options._qty)) {
                                        resolve({
                                            success: false,
                                            message: 'Not enough serial # submitted'
                                        });
                                    } else if (options.serials_clean.length > Number(options._qty)) {
                                        resolve({
                                            success: false,
                                            message: 'Too many serial # submitted'
                                        });
                                    } else {
                                        options.serials_clean.forEach(serial => {
                                            actions.push(
                                                new Promise((resolve, reject) => {
                                                    return serials.create({
                                                        m: {
                                                            serials: options.m.serials,
                                                            sizes:   options.m.sizes
                                                        },
                                                        serial:  serial.serial,
                                                        size_id: size.size_id
                                                    })
                                                    .then(serial_result => {
                                                        if (serial_result.success) {
                                                            let get_location = null;
                                                            if (serial.location_id && String(serial.location_id).trim() !== '') {
                                                                get_location = options.m.locations.findOne({
                                                                    where: {location_id: serial.location_id}
                                                                });
                                                            } else if (serial.location && String(serial.location).trim() !== '') {
                                                                get_location = locations.create({
                                                                    m: {locations: options.m.locations},
                                                                    location: serial.location
                                                                });
                                                            } else {
                                                                resolve({
                                                                    success: false,
                                                                    message: `No location specified for serial: '${serial.serial}'`
                                                                });
                                                            };
                                                            return get_location
                                                            .then(location_result => {
                                                                if (
                                                                    location_result.location_id &&
                                                                    String(location_result.location_id).trim() !== ''
                                                                ) {
                                                                    return options.m.receipt_lines.findOrCreate({
                                                                        where: {
                                                                            serial_id:  serial_result.serial_id,
                                                                            receipt_id: receipt.receipt_id,
                                                                            _status:    1
                                                                        },
                                                                        defaults: {
                                                                            location_id: location_result.location_id,
                                                                            size_id:     size.size_id,
                                                                            user_id:     options.user_id,
                                                                            _qty:        1,
                                                                        }
                                                                    })
                                                                    .then(([receipt_line, created]) => {
                                                                        if (created) {
                                                                            resolve({
                                                                                success: true,
                                                                                message: 'Receipt line created',
                                                                                line: {line_id: receipt_line.line_id}
                                                                            });
                                                                        } else {
                                                                            resolve({
                                                                                success: false,
                                                                                message: 'Serial already exists on this receipt',
                                                                                line: {line_id: receipt_line.line_id}
                                                                            });
                                                                        };
                                                                    })
                                                                    .catch(err => reject(err));

                                                                } else resolve(location_result);
                                                            })
                                                            .catch(err => reject(err));
                                                        } else resolve(serial_result);
                                                    })
                                                    .catch(err => reject(err))
                                                }),
                                            );
                                        });
                                    };
                                };
                            } else {
                                if (
                                    (
                                        !options.location ||
                                        String(options.location).trim() === ''
                                    ) &&
                                    (
                                        !options.location_id ||
                                        String(options.location_id).trim() === ''
                                    )
                                ) {
                                    resolve({
                                        success: false,
                                        message: 'No location submitted'
                                    });
                                } else {
                                    let get_location = null;
                                    if (options.location && String(options.location).trim() !== '') {
                                        get_location = locations.create({
                                            m: {locations: options.m.locations},
                                            location: options.location
                                        });
                                    } else if (options.location_id && String(options.location_id).trim() !== '') {
                                        get_location = options.m.locations.findOne({
                                            where: {location_id: options.location_id}
                                        }); 
                                    } else {
                                        resolve({
                                            success: false,
                                            message: 'No location submitted'
                                        });
                                    };
                                    actions.push(
                                        new Promise((resolve, reject) => {
                                            return get_location
                                            .then(location => {
                                                if (location && location.location_id && String(location.location_id).trim() !== '') {
                                                    return options.m.receipt_lines.findOrCreate({
                                                        where: {
                                                            receipt_id:  receipt.receipt_id,
                                                            size_id:     size.size_id,
                                                            location_id: location.location_id
                                                        },
                                                        defaults: {
                                                            _qty:        options._qty,
                                                            user_id:     options.user_id
                                                        }
                                                    })
                                                    .then(([receipt_line, created]) => {
                                                        if (created) {
                                                            resolve({
                                                                success: true,
                                                                message: 'Receipt line created',
                                                                line: {line_id: receipt_line.line_id}
                                                            });
                                                        } else {
                                                            return receipt_line.increment('_qty', {by: options._qty})
                                                            .then(result => {
                                                                return options.m.notes.create({
                                                                    _table:  'receipt_lines',
                                                                    _id:     receipt_line.line_id,
                                                                    _note:   `Incremented by ${options._qty}${options.note || ''}`,
                                                                    _system: 1,
                                                                    user_id: options.user_id
                                                                })
                                                                .then(note => {
                                                                    resolve({
                                                                        success: true,
                                                                        message: 'Existing receipt line incremented',
                                                                        line: {line_id: receipt_line.line_id}
                                                                    });
                                                                })
                                                                .catch(err => reject(err));
                                                            })
                                                        };
                                                    })
                                                    .catch(err => reject(err));
                                                } else {
                                                    resolve({
                                                        success: false,
                                                        message: 'Could not find/create location'
                                                    })
                                                };
                                            })
                                            .catch(err => reject(err));
                                        })
                                    );
                                };
                            };
                            return Promise.all(actions)
                            .then(results => {
                                resolve({
                                    success: true,
                                    message: 'All actions processed',
                                    results: results
                                });
                            })
                            .catch(err => reject(err));
                        };
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        };
    })
};
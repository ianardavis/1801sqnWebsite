let serials = require(process.env.ROOT + '/fn/serials');
function serial_details_present(serial) {
    return serial.serial && serial.serial !== '' && ((serial.location && serial.location !== '') || (serial.location_id && serial.location_id !== ''))
};
function createReceiptLine (options = {}) {
    return new Promise((resolve, reject) => {
        return options.m.receipt_lines.findOrCreate({
            where: {
                receipt_id: options.receipt_id,
                size_id:    options.size_id,
                stock_id:   options.stock_id
            },
            defaults: {
                _qty:    options._qty,
                user_id: options.user_id
            }
        })
        .then(([line, created]) => {
            if (created) {
                resolve({
                    success: true,
                    message: 'Receipt line created',
                    line: {
                        line_id: line.line_id,
                        created: created
                    }
                });
            } else {
                line.increment('_qty', {by: options._qty})
                .then(result => {
                    options.m.notes.create({
                        _id: line.line_id,
                        _table: 'receipt_lines',
                        _note: `Incremented by ${options._qty}${options.note || ''}`,
                        user_id: options.user_id,
                        _system: 1
                    })
                    .then(note => {
                        resolve({
                            success: true,
                            message: 'Receipt line created',
                            line: {
                                line_id: line.line_id,
                                created: created
                            }
                        });
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            };
        })
        .catch(err => reject(err));
    });
};
module.exports = {
    create: (options = {}) => new Promise((resolve, reject) => {
        return options.m.suppliers.findOne({
            where: {supplier_id: options.supplier_id},
            attributes: ['supplier_id']
        })
        .then(supplier => {
            if (!supplier) {
                resolve({
                    success: false,
                    message: 'Supplier not found'
                });
            } else {
                return options.m.receipts.findOrCreate({
                    where: {
                        supplier_id: supplier.supplier_id,
                        _status1: 1
                    },
                    defaults: {user_id: options.user_id}
                })
                .then(([receipt, created]) => {
                    if (created) {
                        resolve({
                            success: true,
                            message: 'Receipt created',
                            receipt: {
                                receipt_id: receipt.receipt_id,
                                created: created
                            }
                        });
                    } else {
                        resolve({
                            success: true,
                            message: 'Draft receipt already exists',
                            receipt: {
                                receipt_id: receipt.receipt_id,
                                created: created
                            }
                        });
                    };
                })
                .catch(err => reject(err));
            };
        })
        .catch(err => reject(err));
    }),
    createLine: (options = {}) => new Promise((resolve, reject) => {
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
            } else if (!size.supplier_id || size.supplier_id === '') {
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
                            console.log(typeof(options.serials));
                            options.serials_clean = [];
                            if (options.serials && typeof(options.serials) === 'array') {
                                options.serials_clean = options.serials.filter(serial_details_present)
                                if (options.serials_clean.length < Number(options._qty)) {
                                    resolve({
                                        success: false,
                                        message: 'No/Not enough serial # submitted'
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
                                                serials.create({
                                                    m: {
                                                        locations: options.m.locations,
                                                        serials: options.m.serials,
                                                        sizes: options.m.sizes
                                                    },
                                                    location: serial.location,
                                                    serial: serial.serial,
                                                    size_id: size.size_id
                                                })
                                                .then(serial_result => {
                                                    if (serial_result.success) {
                                                        options.m.receipt_lines.create({
                                                            receipt_id: receipt.receipt_id,
                                                            serial_id:  serial_result.serial_id,
                                                            size_id:    size.size_id,
                                                            user_id:    options.user_id,
                                                            _qty:       1
                                                        })
                                                        .then(receipt_line => {
                                                            resolve({
                                                                success: true,
                                                                message: 'Receipt line created',
                                                                line: {line_id: receipt_line.line_id}
                                                            });
                                                        })
                                                        .catch(err => reject(err));
                                                    } else {
                                                        resolve(serial_result)
                                                    };
                                                })
                                                .catch(err => reject(err))
                                            }),
                                        );
                                    });
                                    Promise.all(actions)
                                    .then(results => {
                                        console.log(results);
                                        resolve({
                                            success: true,
                                            message: 'All lines processed',
                                            results: results
                                        });
                                    })
                                };
                            } else {
                                resolve({
                                    success: false,
                                    message: 'Serial # not submitted'
                                });
                            };
                        } else {
                            if (options.receive_to.stock_id && options.receive_to.stock_id !== '') {
                                options.m.stock.findOne({
                                    where: {stock_id: options.receive_to.stock_id}
                                })
                                .then(stock => {
                                    createReceiptLine(
                                        ...options,
                                        ...{
                                            receipt_id: receipt.receipt_id,
                                            size_id: size.size_id,
                                            stock_id: stock.stock_id
                                        }
                                    )
                                    .then(result => resolve(result))
                                    .catch(err => reject(err));
                                })
                                .catch(err => reject(err));
                            } else if (options.receive_to.location && options.receive_to.location !== '') {
                                options.m.locations.findOrCreate({
                                    where: {_location: options.receive_to.location}
                                })
                                .then(([location, created]) => {
                                    options.m.stock.findOrCreate({
                                        where: {
                                            size_id: size.size_id,
                                            location_id: location.location_id
                                        },
                                        defaults: {_qty: 0}
                                    })
                                    .then(stock => {
                                        createReceiptLine(
                                            ...options,
                                            ...{
                                                receipt_id: receipt.receipt_id,
                                                size_id: size.size_id,
                                                stock_id: stock.stock_id
                                            }
                                        )
                                        .then(result => resolve(result))
                                        .catch(err => reject(err));
                                    })
                                    .catch(err => reject(err));
                                })
                                .catch(err => reject(err));
                            } else {
                                resolve({
                                    success: false,
                                    message: 'No location or stock ID submitted'
                                });
                            };
                        };
                    };
                })
                .catch(err => reject(err));
            };
        })
        .catch(err => reject(err));
    })
};
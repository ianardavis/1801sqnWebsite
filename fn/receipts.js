module.exports = {
    create: (options = {}) => new Promise((resolve, reject) => {
        return options.m.suppliers.findOne({
            where: {supplier_id: options.supplier_id},
            attributes: ['supplier_id']
        })
        .then(supplier => {
            if (!supplier) return reject(new Error('Supplier not found'))
            else {
                return options.m.receipts.findOrCreate({
                    where: {
                        supplier_id: supplier.supplier_id,
                        _status: 1
                    },
                    defaults: {user_id: options.user_id}
                })
                .then(([receipt, created]) => resolve({receipt_id: receipt.receipt_id, created: created}))
                .catch(err => reject(err));
            };
        })
        .catch(err => reject(err));
    }),
    createLine: (options = {}) => new Promise((resolve, reject) => {
        options.m.sizes.findOne({
            where: {size_id: options.size_id},
            attributes: ['size_id', 'supplier_id']
        })
        .then(size => {
            if (!size) reject(new Error('Size not found'))
            else {
                options.m.receipts.findOne({
                    where: {receipt_id: options.receipt_id},
                    attributes: ['receipt_id', 'supplier_id', '_status']
                })
                .then(receipt => {
                    if (!receipt)                                                          reject(new Error('Receipt not found'))
                    else if (receipt._status !== 1)                                        reject(new Error('Lines can only be added to draft receipts'))
                    else if (size.supplier_id !== receipt.supplier_id)                     reject(new Error('Size is not from this supplier'))
                    else if (size._serials  && (!line._serial   || line._serial === ''))   reject(new Error('No Serial # submitted'))
                    else if (size._serials  && (!line._location || line._location === '')) reject(new Error('No location submitted'))
                    else if (!size._serials && (!line.stock_id  || line.stock_id === ''))  reject(new Error('No Stock submitted'))
                    else {
                        let actions = [];
                        if (size._serials) {
                            actions.push(new Promise((resolve, reject) => {
                                return options.m.locations.findOrCreate({
                                    where: {_location: line._location}
                                })
                                .then(([location, created]) => {
                                    return options.m.serials.findOrCreate({
                                        where: {
                                            _serial: line._serial,
                                            size_id: size.size_id
                                        },
                                        defaults: {location_id: location.location_id}
                                    })
                                    .then(([serial, created]) => {
                                        if (!created) reject(new Error('Serial # already exists for this size'))
                                        else {
                                            options.line.serial_id = serial.serial_id;
                                            resolve(true);
                                        };
                                    })
                                    .catch(er => reject(err));
                                })
                                .catch(er => reject(err));
                            }));   
                        };
                        Promise.all(actions)
                        .then(result => {
                            return options.m.receipt_lines.findOrCreate({
                                where: {
                                    receipt_id: receipt.receipt_id,
                                    size_id: size.size_id,
                                    _status: 1
                                },
                                defaults: {
                                    _qty: options._qty,
                                    user_id: options.user_id
                                }
                            })
                            .then(([line, created]) => {
                                let _note = '', actions = [];;
                                if (created) _note += `Created${options.note_addition || ''}`
                                else {
                                    actions.push(line.increment('_qty', {by: options._qty}));
                                    _note += `Incremented by ${request_line._qty}${options.note_addition || ''}`;
                                };
                                actions.push(
                                    m.notes.create({
                                        _id: receipt.receipt_id,
                                        _table: 'receipts',
                                        _note: _note,
                                        user_id: options.user_id,
                                        _system: 1
                                    })
                                );
                                return Promise.all(actions)
                                .then(note => resolve({line_id: line.line_id, created: created}))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            };
        })
        .catch(err => reject(err));
    })
};
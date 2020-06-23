module.exports = {
    create: (options = {}) => new Promise((resolve, reject) => {
        options.m.receipts.findOne({
            where: {
                supplier_id: options.receipt.supplier_id,
                _complete: 0
            }
        })
        .then(_receipt => {
            if (_receipt) resolve({receipt_id: _receipt.receipt_id, created: false})
            else {
                options.m.receipts.create(options.receipt)
                .then(new_receipt => resolve({receipt_id: new_receipt.receipt_id, created: true}))
                 .catch(err => reject(err));
            }
        })
        .catch(err => reject(err));
    }),
    createLine: (options = {}) => new Promise((resolve, reject) => {
        options.m.sizes.findOne({where: {size_id: options.line.size_id}})
        .then(size => {
            if (size) {
                options.m.stock.findOne({where: {stock_id: options.line.stock_id}})
                .then(stock => {
                    if (stock) {
                        options.m.receipts.findOne({where: {receipt_id: options.line.receipt_id}})
                        .then(receipt => {
                            if (!receipt) {
                                reject(new Error('Receipt not found'))
                            } else if (receipt._complete) {
                                reject(new Error('Lines can not be added to completed receipts'))
                            } else if (Number(size.supplier_id) !== Number(receipt.supplier_id)) {
                                reject(new Error('Size is not for this supplier'))
                            } else if (size._serials && !options.line._serial) {
                                reject(new Error('You must specify a serial #'))
                            } else if (size._serials) {
                                options.m.serials.create({
                                    _serial: options.line._serial,
                                    size_id: size.size_id
                                })
                                .then(serial => {
                                    options.line.serial_id = serial.serial_id;
                                    options.m.receipt_lines.create(options.line)
                                    .then(receipt_line => {
                                        options.m.stock.findByPk(receipt_line.stock_id)
                                        .then(stock => stock.increment('_qty', {by: receipt_line._qty}))
                                        .then(stock => resolve(receipt_line.line_id))
                                        .catch(err => reject(err));
                                    })
                                    .catch(err => reject(err));
                                })
                                .catch(err => reject(err));
                            } else {
                                options.m.receipt_lines.findOne({
                                    where: {
                                        receipt_id: receipt.receipt_id,
                                        size_id:    size.size_id,
                                        stock_id:   options.line.stock_id
                                    }
                                })
                                .then(receipt_line => {
                                    if (receipt_line) {
                                        options.m.receipt_lines.findByPk(receipt_line.line_id)
                                        .then(stock => stock.increment('_qty', {by: options.line._qty}))
                                        .then(stock => {
                                            resolve(Number(stock._qty) + Number(by))
                                            options.m.stock.findByPk(receipt_line.stock_id)
                                            .then(stock => stock.increment('_qty', {by: options.line._qty}))
                                            .then(result => resolve(receipt_line.line_id))
                                            .catch(err => reject(err));
                                        })
                                        .catch(err => reject(err));
                                    } else {
                                        options.m.receipt_lines.create(options.line)
                                        .then(receipt_line => {
                                            options.m.stock.findByPk(receipt_line.stock_id)
                                            .then(stock => stock.increment('_qty', {by: receipt_line._qty}))
                                            .catch(err => reject(err));
                                        })
                                        .catch(err => reject(err));
                                    };
                                })
                                .catch(err => reject(err));
                            };
                        })
                        .catch(err => reject(err));
                    } else reject(new Error('Stock not found'));
                })
                .catch(err => reject(err))
            } else reject(new Error('Size not found'))
        })
        .catch(err => reject(err));
    })
};
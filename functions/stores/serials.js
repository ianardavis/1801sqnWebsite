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
                    return serial.update({
                        location_id: location_id,
                        issue_id:    null
                    })
                    .then(result => {
                        if (!result) reject(new Error('Serial # not updated'))
                        else resolve([serial]);
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
};
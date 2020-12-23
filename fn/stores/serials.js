module.exports = function (m, serials) {
    serials.create = function (options = {}) {
        return new Promise((resolve, reject) => {
            if (options.serial && options.size_id) {
                return m.sizes.findOne({
                    where: {size_id: options.size_id},
                    attributes: ['size_id', '_serials']
                })
                .then(size => {
                    if      (!size)          resolve({success: false, message: 'Size not found'});
                    else if (!size._serials) resolve({success: false, message: 'This size does not have serials'});
                    else {
                        return m.serials.findOrCreate({
                            where: {
                                size_id: size.size_id,
                                _serial: options.serial
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
};
module.exports = function (m, location) {
    location.create = function (options = {}) {
        return new Promise((resolve, reject) => {
            if (options.location) {
                return m.stores.locations.findOrCreate({
                    where: {_location: options.location}
                })
                .then(([location, created]) => {
                    resolve({
                        success: true,
                        message: 'Location found/created',
                        location_id: location.location_id,
                        created: created
                    });
                })
                .catch(err => reject(err));
            } else {
                resolve({
                    success: false,
                    message: 'Not all required fields have been submitted'
                });
            };
        });
    };
};
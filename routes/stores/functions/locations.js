module.exports = function (m, location) {
    location.create = function (options = {}) {
        return new Promise((resolve, reject) => {
            if (options.location) {
                return m.locations.findOrCreate({
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
    location.check = function (options = {}) {
        return new Promise((resolve, reject) => {
            if (options.location_id) {
                m.locations.findOne({
                    where: {location_id: options.location_id},
                    attributes: ['location_id']
                })
                .then(location => {
                    if (!location) reject(new Error('Location not found'))
                    else           resolve(location.location_id)
                })
                .catch(err => reject(err));
            } else if (options._location) {
                m.locations.findOrCreate({where: {_location: options._location}})
                .then(([location, created]) => resolve(location.location_id))
                .catch(err => reject(err));
            } else reject(new Error('No location specified'))
        });
    };
};
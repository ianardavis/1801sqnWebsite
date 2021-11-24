module.exports = function (m, fn) {
    fn.locations = {};
    fn.locations.create = function (options = {}) {
        return new Promise((resolve, reject) => {
            if (options.location) {
                return m.locations.findOrCreate({
                    where: {location: options.location}
                })
                .then(([location, created]) => {
                    if (created) resolve({location_id: location.location_id})
                    else reject(new Error('Location already exists'));
                })
                .catch(err => reject(err));
            } else reject(new Error('No location specified'));
        });
    };
    fn.locations.get = function (options = {}) {
        return new Promise((resolve, reject) => {
            if (options.location_id) {
                fn.get(
                    'locations',
                    {location_id: options.location_id}
                )
                .then(location => resolve(location.location_id))
                .catch(err => reject(err));
            } else if (options.location) {
                m.locations.findOrCreate({where: {location: options.location}})
                .then(([location, created]) => resolve(location.location_id))
                .catch(err => reject(err));
            } else reject(new Error('No location specified'))
        });
    };
};
module.exports = function (m, fn) {
    fn.locations = {};
    function get (location_id) {
        return new Promise((resolve, reject) => {
            m.locations.findOne({where: {location_id: location_id}})
            .then(location => {
                if (location) {
                    resolve(location);
                } else {
                    reject(new Error('Location not found'));
                };
            })
            .catch(err => reject(err));
        });
    }
    fn.locations.create = function (location) {
        return new Promise((resolve, reject) => {
            if (location) {
                m.locations.findOrCreate({
                    where: {location: location}
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
                get(options.location_id)
                .then(location => resolve(location))
                .catch(err => reject(err));
            } else if (options.location) {
                m.locations.findOrCreate({where: {location: options.location}})
                .then(([location, created]) => resolve(location))
                .catch(err => reject(err));
            } else reject(new Error('No location specified'))
        });
    };
};
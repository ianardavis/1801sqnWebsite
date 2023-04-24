module.exports = function (m, fn) {
    fn.locations = {};

    fn.locations.get_by_ID = function (location_id) {
        return new Promise((resolve, reject) => {
            m.locations.findOne({where: {location_id: location_id}})
            .then(location => {
                if (location) {
                    resolve(location);

                } else {
                    reject(new Error('Location not found'));

                };
            })
            .catch(reject);
        });
    };
    fn.locations.get_by_location = function (location) {
        return new Promise((resolve, reject) => {
            m.locations.findOne({where: {location: location}})
            .then(location => {
                if (location) {
                    resolve(location);

                } else {
                    reject(new Error('Location not found'));

                };
            })
            .catch(reject);
        });
    };
    fn.locations.get_all = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.locations.findAndCountAll({
                where: where,
                ...pagination
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };
    fn.locations.get = function (search) {
        if (search.location_id) {
            return fn.locations.get_by_ID(search.location_id);

        } else if (search.location) {
            return fn.locations.get_by_location(search.location);

        } else {
            return new Promise.reject(new Error('No location ID or location specified'));

        };
    };

    fn.locations.find_or_create = function (location) {
        if (location) {
            return new Promise((resolve, reject) => {
                    m.locations.findOrCreate({where: {location: location}})
                    .then(([new_location, created]) => resolve(new_location))
                    .catch(reject);
            });

        } else {
            return Promise.reject(new Error('No location specified'));
            
        };
    };

    fn.locations.edit = function (location_id, new_location) {
        if (new_location) {
            return new Promise((resolve, reject) => {
                fn.locations.get_by_ID(location_id)
                .then(location => {
                    fn.locations.get_by_location(new_location)
                    .then(existing_location => reject(new Error('Location already exists')))
                    .catch(err => {
                        if (err.message === 'Location not found') {
                            fn.update(location, {location: new_location})
                            .then(resolve)
                            .catch(reject);
    
                        } else {
                            reject(err);
    
                        };
                    });
                })
                .catch(reject);
            });
            
        } else {
            return Promise.reject(new Error('No location text specified'));

        };
    };
};
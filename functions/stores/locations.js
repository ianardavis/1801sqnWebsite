module.exports = function (m, fn) {
    fn.locations = {};

    fn.locations.findByID = function (location_id) {
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
    fn.locations.findByLocation = function (location) {
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
    fn.locations.findAll = function (query) {
        return m.locations.findAndCountAll({
            where: query.where,
            ...fn.pagination(query)
        });
    };
    fn.locations.get = function (search) {
        if (search.location_id) {
            return fn.locations.findByID(search.location_id);

        } else if (search.location) {
            return fn.locations.findByLocation(search.location);

        } else {
            return new Promise.reject(new Error('No location ID or location specified'));

        };
    };

    fn.locations.findOrCreate = function (site_id, location) {
        if (location) {
            return new Promise((resolve, reject) => {
                m.locations.findOrCreate({where: {
                    location: location,
                    site_id:  site_id
                }})
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
                fn.locations.findByID(location_id)
                .then(location => {
                    fn.locations.findByLocation(new_location)
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
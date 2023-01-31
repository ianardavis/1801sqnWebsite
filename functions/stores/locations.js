module.exports = function (m, fn) {
    fn.locations = {};

    fn.locations.getByID = function (location_id) {
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
    };
    fn.locations.getByLocation = function (location) {
        return new Promise((resolve, reject) => {
            m.locations.findOne({where: {location: location}})
            .then(location => {
                if (location) {
                    resolve(location);

                } else {
                    reject(new Error('Location not found'));

                };
            })
            .catch(err => reject(err));
        });
    };
    fn.locations.getAll = function (query) {
        return new Promise((resolve, reject) => {
            m.locations.findAndCountAll({
                where: query.where,
                ...fn.pagination(query)
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
        });
    };
    fn.locations.get = function (search) {
        if (search.location_id) {
            return fn.locations.getByID(search.location_id);

        } else if (search.location) {
            return fn.locations.getByLocation(search.location);

        } else {
            return new Promise.reject(new Error('No location ID or location specified'));

        };
    };

    fn.locations.findOrCreate = function (location) {
        return new Promise((resolve, reject) => {
            if (location) {
                m.locations.findOrCreate({where: {location: location}})
                .then(([new_location, created]) => resolve(new_location))
                .catch(err => reject(err));

            } else {
                reject(new Error('No location specified'));
                
            };
        });
    };

    fn.locations.edit = function (location_id, new_location) {
        return new Promise((resolve, reject) => {
            if (new_location) {
                fn.locations.getByID(location_id)
                .then(location => {
                    if (location) {
                        fn.locations.getByLocation(new_location)
                        .then(existing_location => reject(new Error('Location already exists')))
                        .catch(err => {
                            if (err.message === 'Location not found') {
                                location.update({location: new_location})
                                .then(result => resolve(result))
                                .catch(err => reject(err));
    
                            } else {
                                reject(err);
    
                            };
                        });
    
                    } else {
                        reject(new Error('Location not found'));
    
                    };
                })
                .catch(err => reject(err));

            } else {
                reject(new Error('No location text specified'));

            };
        });
    };
};
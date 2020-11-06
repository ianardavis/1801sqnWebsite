module.exports = {
    create: (options = {}) => new Promise((resolve, reject) => {
        if (
            options.location &&
            options.m        &&
            options.m.locations
        ) {
            return options.m.locations.findOrCreate({
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
    })
};
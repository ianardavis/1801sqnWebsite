module.exports = {
    add: (options = {}, size, details) => new Promise((resolve, reject) => {
        options.m.sizes.findOrCreate({
            where: {
                item_id: options.details.item_id,
                _size: options.details._size
            },
            defaults: options.details
        })
        .then(([size, created]) => {
            let message = null;
            if (!created) message = 'Size already exists'
            resolve({size: size._size, created: created, message: message})
        })
        .catch(err => reject({created: false, message: err.message}));
    })
};
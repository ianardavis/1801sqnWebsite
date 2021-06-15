module.exports = function (m, fn) {
    fn.sizes = {};
    fn.sizes.get = function (size_id) {
        return new Promise((resolve, reject) => {
            return m.sizes.findOne({where: {size_id: size_id}})
            .then(size => {
                if (!size) reject(new Error('Size not found'))
                else resolve(size);
            })
            .catch(err => reject(err));
        });
    };
};
module.exports = function (m, fn) {
    fn.adjustments = {};
    fn.adjustments.get = function (where) {
        return new Promise((resolve, reject) => {
            m.adjustments.findOne({where: where})
            .then(adjustment => {
                if (adjustment) {
                    resolve(adjustment);

                } else {
                    reject(new Error('Adjustment not found'));

                };
            })
            .catch(err => reject(err));
        });
    };
};
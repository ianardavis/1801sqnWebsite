module.exports = function (m, fn) {
    fn.giftaid = {};
    fn.giftaid.get = function (where) {
        return new Promise((resolve, reject) => {
            m.giftaid.findOne({where: where})
            .then(giftaid => {
                if (giftaid) resolve(giftaid)
                else reject(new Error('Giftaid record not found'));
            })
            .catch(err => reject(err));
        });
    };
    fn.giftaid.create = function (giftaid) {
        return new Promise((resolve, reject) => {
            m.giftaid.create(giftaid)
            .then(giftaid => resolve(true))
            .catch(err => reject(err));
        });
    };
};
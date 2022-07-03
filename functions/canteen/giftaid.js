module.exports = function (m, fn) {
    fn.giftaid = {};
    fn.giftaid.create = function (giftaid) {
        return new Promise((resolve, reject) => {
            m.giftaid.create(giftaid)
            .then(giftaid => resolve(true))
            .catch(err => reject(err));
        });
    };
};
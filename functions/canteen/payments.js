module.exports = function (m, fn) {
    fn.payments = {};
    fn.payments.create = function (sale_id, amount, user_id, type = 'Cash') {
        return new Promise((resolve, reject) => {
            m.payments.create({
                sale_id: sale_id,
                amount:  amount,
                type:    type,
                user_id: user_id
            })
            .then(payment => resolve(true))
            .catch(err => reject(err));
        });
    };
};
module.exports = function (m, fn) {
    fn.payments = {};
    fn.payments.create = function (sale_id, amount, user_id, options = {}) {
        return new Promise((resolve, reject) => {
            m.payments.create({
                sale_id: sale_id,
                amount:  amount,
                type:    options.type || 'Cash',
                user_id: user_id,
                user_id_payment: options.user_id_payment || null
            })
            .then(payment => resolve(true))
            .catch(err => reject(err));
        });
    };
};
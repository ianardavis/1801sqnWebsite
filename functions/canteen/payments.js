module.exports = function (m, fn) {
    fn.payments = {};
    fn.payments.get = function (payment_id) {
        return new Promise((resolve, reject) => {
            m.payments.findOne({where: {payment_id: payment_id}})
            .then(payment => {
                if (payment) {
                    resolve(payment);

                } else {
                    reject(new Error('Payment not found'));

                };
            })
            .catch(err => reject(err));
        });
    };
    fn.payments.getAll = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.payments.findAndCountAll({
                where: where,
                include: [
                    fn.inc.canteen.sale(),
                    fn.inc.users.user()
                ],
                ...pagination
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
        });
    };
    fn.payments.getAllForSession = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.payments.findAndCountAll({
                include: [
                    fn.inc.canteen.sale({
                        where:    where,
                        required: true
                    }),
                    fn.inc.users.user()
                ],
                ...pagination
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
        });
    };

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
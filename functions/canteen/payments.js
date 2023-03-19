module.exports = function (m, fn) {
    fn.payments = {};
    fn.payments.get = function (where) {
        return fn.get(
            m.payments,
            where
        );
    };
    fn.payments.get_all = function (where, pagination) {
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
    fn.payments.get_all_for_session = function (where, pagination) {
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
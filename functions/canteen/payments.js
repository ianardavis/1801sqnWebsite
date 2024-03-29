module.exports = function (m, fn) {
    fn.payments = {};
    fn.payments.find= function (where) {
        return fn.find(
            m.payments,
            where
        );
    };
    fn.payments.findAll = function (query) {
        return new Promise((resolve, reject) => {
            m.payments.findAndCountAll({
                where: query.where,
                include: [
                    fn.inc.canteen.sale(),
                    fn.inc.users.user()
                ],
                ...fn.pagination(query)
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };
    fn.payments.findAllForSession = function (where, pagination) {
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
            .catch(reject);
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
            .catch(reject);
        });
    };
};
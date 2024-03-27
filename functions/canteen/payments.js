module.exports = function ( m, fn ) {
    fn.payments = {};
    fn.payments.find = function ( where ) {
        return fn.find(
            m.payments,
            where
        );
    };
    fn.payments.findAll = function ( query ) {
        return new Promise( ( resolve, reject ) => {
            m.payments.findAndCountAll({
                where: query.where,
                include: [
                    { 
                        model: m.sales,
                        include: [{
                            model:      m.users,
                            include:    [ m.ranks ],
                            attributes: fn.users.attributes.slim(),
                            as:         'user'
                        }],
                        as: 'sale' },
                    {
                        model:      m.users,
                        include:    [ m.ranks ],
                        attributes: fn.users.attributes.slim(),
                        as:         'user'
                    }
                ],
                ...fn.pagination( query )
            })
            .then( resolve )
            .catch( reject );
        });
    };
    fn.payments.findAllForSession = function ( where, pagination ) {
        return new Promise( ( resolve, reject ) => {
            m.payments.findAndCountAll({
                include: [
                    fn.inc.canteen.sale({
                        where:    where,
                        required: true
                    }),
                    {
                        model:      m.users,
                        include:    [ m.ranks ],
                        attributes: fn.users.attributes.slim(),
                        as:         'user'
                    }
                ],
                ...pagination
            })
            .then( resolve )
            .catch( reject );
        });
    };

    fn.payments.create = function ( sale_id, amount, user_id, options = {} ) {
        return new Promise( ( resolve, reject ) => {
            m.payments.create({
                sale_id: sale_id,
                amount:  amount,
                type:    options.type || 'Cash',
                user_id: user_id,
                user_id_payment: options.user_id_payment || null
            })
            .then( payment => resolve( true ) )
            .catch( reject );
        });
    };
};
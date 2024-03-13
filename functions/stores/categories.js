module.exports = function ( m, fn ) {
    fn.categories = {};
    fn.categories.find = function ( where ) {
        return new Promise( ( resolve, reject ) => {
            m.categories.findOne({
                where: where,
                include: [{
                    model: m.categories,
                    as:    'parent'
                }]
            })
            .then( fn.rejectIfNull )
            .then( resolve )
            .catch( reject );
        });
    };
    fn.categories.findAll = function ( query ) {
        return m.categories.findAndCountAll({
            where: query.where || {},
            include: [{
                model: m.categories,
                as:    'parent'
            }],
            ...fn.pagination(query)
        });
    };
    fn.categories.edit = function ( category_id, details ) {
        return new Promise( ( resolve, reject ) => {
            if ( details.parent_category_id === '' ) details.parent_category_id = null;

            fn.categories.find( { category_id: category_id } )
            .then( category => {
                category.update( details )
                .then( fn.checkUpdateResult )
                .then( resolve )
                .catch( reject );
            })
            .catch( reject );
        });
    };
    fn.categories.create = function ( category, user_id ) {
        return new Promise( ( resolve, reject ) => {
            if ( category.parent_category_id === '' ) delete category.parent_category_id;

            m.categories.create({
                user_id: user_id,
                ...category
            })
            .then( resolve )
            .catch( reject );
        });
    };
    fn.categories.delete = function ( category_id ) {
        return new Promise( ( resolve, reject ) => {
            fn.categories.find( { category_id: category_id } )
            .then( category => {
                m.item_categories.destroy(
                    { where: { category_id: category.category_id } }
                )
                .then( result => {
                    category.destroy()
                    .then( fn.checkDestroyResult )
                    .then( resolve )
                    .catch( reject );
                })
                .catch( reject );
            })
            .catch( reject );
        });
    };
};
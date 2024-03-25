module.exports = function ( m, fn ) {
    fn.nsns.classes.find = function ( where ) {
        return fn.find(
            m.nsn_classes,
            where
        );
    };
    fn.nsns.classes.findAll = function ( query ) {
        return new Promise( ( resolve, reject ) => {
            if ( query.nsn_group_id === '' ) query.nsn_group_id = null;
            m.nsn_classes.findAndCountAll({
                where: query.where,
                ...fn.pagination( query )
            })
            .then( resolve )
            .catch( reject );
        });
    };
};
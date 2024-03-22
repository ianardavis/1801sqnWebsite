module.exports = function ( m, fn ) {
    fn.nsns.countries.find = function (where) {
        return fn.find(
            m.nsn_countries,
            where
        );
    };
    fn.nsns.countries.findAll = function ( query ) {
        return new Promise( ( resolve, reject ) => {
            m.nsn_countries.findAndCountAll({
                where: query.where,
                ...fn.pagination( query )
            })
            .then(results => resolve(results))
            .catch( reject );
        });
    };
};
module.exports = function ( m, fn ) {
    fn.adjustments = {};
    fn.adjustments.find = function ( where ) {
        return new Promise( ( resolve, reject ) => {
            m.adjustments.findOne({
                where: where
            })
            .then( fn.rejectIfNull )
            .then( resolve )
            .catch( reject )
        });
    };
};
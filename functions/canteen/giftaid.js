module.exports = function ( m, fn ) {
	fn.giftaid = {};
    fn.giftaid.find = function ( where ) {
        return fn.find(
            m.giftaid,
            where
        );
    };
	fn.giftaid.findAll = function ( query ) {
		return new Promise( ( resolve, reject ) => {
			m.giftaid.findAndCountAll({
				where: query.where,
				...fn.pagination( query )
			})
			.then( resolve )
			.catch( reject );
		});
	};

	fn.giftaid.create = function ( giftaid ) {
		return new Promise( ( resolve, reject ) => {
			if ( giftaid ) {
				m.giftaid.create( giftaid )
				.then( resolve )
				.catch( reject );

			} else {
				reject( new Error( 'No record' ) );

			};
		});
	};

	fn.giftaid.edit = function ( giftaid_id, details ) {
		return new Promise( ( resolve, reject ) => {
			if ( giftaid ) {
				m.giftaid.findOne({
					where: { giftaid_id: giftaid_id } 
				})
				.then( fn.rejectIfNull )
				.then( giftaid => {
					giftaid.update( details )
					.then( fn.checkResult )
					.then( resolve )
					.catch( reject );
				})
				.catch( reject );

			} else {
				reject( new Error( 'No record' ) );

			};
		});
	};
};
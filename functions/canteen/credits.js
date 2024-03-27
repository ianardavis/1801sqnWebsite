module.exports = function ( m, fn ) {
	fn.credits = {};
    fn.credits.findAll = function ( query ) {
		return new Promise( ( resolve, reject ) => {
			m.credits.findAndCountAll({
				include: [{
					model:      m.users,
					include:    [ m.ranks ],
					attributes: fn.users.attributes.slim(),
					as:         'user'
				}],
				...fn.pagination( query )
			})
			.then( resolve )
			.catch( reject );
		});
	};
};
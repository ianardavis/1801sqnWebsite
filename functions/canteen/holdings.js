module.exports = function ( m, fn ) {
	fn.holdings = {};
    fn.holdings.find = function ( where ) {
		return new Promise( ( resolve, reject ) => {
			m.holdings.findOne({
				where: where
			})
			.then( fn.rejectIfNull )
			.then( resolve )
			.catch( reject );
		});
    };
	fn.holdings.findAll = function ( query ) {
		return new Promise( ( resolve, reject ) => {
			m.holdings.findAndCountAll({
				where: query.where,
				...fn.pagination( query )
			})
			.then( resolve )
			.catch( reject );
		});
	};
	fn.holdings.edit = function ( holding_id, details ) {
		return new Promise( ( resolve, reject ) => {
			m.holdings.findOne({
				where: { holding_id }
			})
			.then( fn.rejectIfNull )
			.then( holding => {
				holding.update( details )
				.then( fn.checkResult )
				.then( resolve )
				.catch( reject );
			})
			.catch( reject );
		});
	};
	function createAction( holding_id, action, user_id ) {
		return new Promise(resolve => {
			fn.actions.create([
				`HOLDING | ${ action }`,
				user_id,
				[ { _table: 'holdings', id: holding_id } ]
			])
			.then( result => resolve( true ) );
		});
	};

	fn.holdings.create = function ( holding, user_id ) {
		function checkHoldingDetails( holding ) {
			return new Promise( ( resolve, reject ) => {
				if ( !holding ) {
					reject( new Error( 'No holding details' ) );
	
				} else if (!holding.description) {
					reject( new Error( 'No description submitted' ) );
	
				} else {
					resolve( holding );
	
				};
			});
		};
		function createHolding( holding ) {
			return new Promise( ( resolve, reject ) => {
				m.holdings.findOrCreate({
					where:    { description: holding.description },
					defaults: { cash:        holding.cash || 0.0 }
				})
				.then( ( [ holding, created ] ) => {
					if ( created ) {
						resolve( [ holding.holding_id, holding.cash ] );
						
					} else {
						reject( new Error( 'A holding with this description already exists' ) );
						
					};
				})
				.catch( reject );
			});
		};
		return new Promise( ( resolve, reject ) => {
			checkHoldingDetails( holding )
			.then( createHolding )
			.then( ( [ holding_id, cash ] ) => {
				createAction(
					holding_id,
					`CREATED: Opening balance: £${ Number( cash ).toFixed( 2 ) }`,
					user_id
				)
				.then( resolve )
				.catch(err => {
					console.error( err );
					resolve( false );
				});
			})
			.catch( reject );
		});
	};

	fn.holdings.count = function ( holding_id, balance, user_id ) {
		return new Promise( ( resolve, reject ) => {
			m.holdings.findOne({
				where: { holding_id }
			})
			.then( fn.rejectIfNull )
			.then( holding =>  {
				const cash = fn.sessions.countCash( balance );
				holding.update( { cash: cash } )
				.then( fn.checkResult )
				.then( result => {
					let state = ( cash === holding.cash ?
						'correct' : 
						`${ ( holding.cash < cash ?
							'under' :
							'over'
						) }`
					);
					let variance = Math.abs( holding.cash - cash );

					createAction(
						holding.holding_id,
						`COUNT | Balance: £${ Number( cash ).toFixed( 2 ) }. Holding ${ state } | Variance: ${ variance }`,
						user_id
					)
					.then( resolve );
				})
				.catch( reject );
			})
			.catch( reject );
		});
	};
};
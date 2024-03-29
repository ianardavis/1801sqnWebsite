module.exports = function (m, fn) {
	fn.holdings = {};
    fn.holdings.find = function (where) {
        return fn.find(
            m.holdings,
            where
        );
    };
	fn.holdings.findAll = function (query) {
		return new Promise((resolve, reject) => {
			m.holdings.findAndCountAll({
				where: query.where,
				...fn.pagination(query)
			})
			.then(results => resolve(results))
			.catch(reject);
		});
	};
	fn.holdings.edit = function (holding_id, details) {
		return new Promise((resolve, reject) => {
			fn.holding.get(holding_id)
			.then(holding => {
				fn.update(holding, details)
				.then(result => resolve(result))
				.catch(reject);
			})
			.catch(reject);
		});
	};
	function createAction(holding_id, action, user_id) {
		return new Promise(resolve => {
			fn.actions.create([
				`HOLDING | ${action}`,
				user_id,
				[{_table: 'holdings', id: holding_id}]
			])
			.then(result => resolve(true));
		});
	};

	// CREATE FUNCTIONS
	fn.holdings.create = function (holding, user_id) {
		function check_holding_details(holding) {
			return new Promise((resolve, reject) => {
				if (!holding) {
					reject(new Error('No holding details'));
	
				} else if (!holding.description) {
					reject(new Error('No description submitted'));
	
				} else {
					resolve(true);
	
				};
			});
		};
		function create_holding(holding) {
			return new Promise((resolve, reject) => {
				m.holdings.findOrCreate({
					where:    {description: holding.description},
					defaults: {cash:        holding.cash || 0.0}
				})
				.then(([holding, created]) => {
					if (created) {
						resolve([holding.holding_id, holding.cash]);
						
					} else {
						reject(new Error('This holding already exists'));
						
					};
				})
				.catch(reject);
			});
		};
		return new Promise((resolve, reject) => {
			check_holding_details(holding)
			.then(result => {
				create_holding(holding)
				.then(([holding_id, cash]) => {
					createAction(holding_id, `CREATED: Opening balance: £${Number(cash).toFixed(2)}`, user_id)
					.then(result => resolve(true))
					.catch(err => {
						console.error(err);
						resolve(false);
					});
				})
				.catch(reject);
			})
			.catch(reject);
		});
	};

	// COUNT FUNCTIONS
	fn.holdings.count = function (holding_id, balance, user_id) {
		return new Promise((resolve, reject) => {
			fn.holding.get(holding_id)
			.then(holding => {
				let cash = fn.sessions.countCash(balance);
				fn.update(holding, {cash: cash})
				.then(result => {
					let state = (cash === holding.cash ?
						'correct' : 
						`${(holding.cash < cash ?
							'under' :
							'over'
						)}`
					);
					let variance = Math.abs(holding.cash - cash);

					createAction(
						holding.holding_id,
						`COUNT | Balance: £${Number(cash).toFixed(2)}. Holding ${state} | Variance: ${variance}`,
						user_id
					)
					.then(result => resolve(true));
				})
				.catch(reject);
			})
			.catch(reject);
		});
	};
};
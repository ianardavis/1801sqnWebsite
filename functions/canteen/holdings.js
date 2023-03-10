module.exports = function (m, fn) {
	fn.holdings = {};
	fn.holdings.get = function (holding_id) {
		return new Promise((resolve, reject) => {
			m.holdings.findOne({
				where: {holding_id: holding_id}
			})
			.then(holding => {
				if (holding) {
					resolve(holding);

				} else {
					reject(new Error('Holding not found'));
					
				};
			})
			.catch(err => reject(err));
		});
	};
	fn.holdings.getAll = function (where, pagination) {
		return new Promise((resolve, reject) => {
			m.holdings.findAndCountAll({
				where: where,
				...pagination
			})
			.then(results => resolve(results))
			.catch(err => reject(err));
		});
	};
	fn.holdings.edit = function (holding_id, details) {
		return new Promise((resolve, reject) => {
			fn.holding.get(holding_id)
			.then(holding => {
				holding.update(details)
				.then(result => resolve(result))
				.catch(err => reject(err));
			})
			.catch(err => reject(err));
		});
	};
	function create_action(holding_id, action, user_id) {
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
			.catch(err => reject(err));
		});
	};
	fn.holdings.create = function (holding, user_id) {
		return new Promise((resolve, reject) => {
			check_holding_details(holding)
			.then(result => {
				create_holding(holding)
				.then(([holding_id, cash]) => {
					create_action(holding_id, `CREATED: Opening balance: £${Number(cash).toFixed(2)}`, user_id)
					.then(result => resolve(true))
					.catch(err => {
						console.log(err);
						resolve(false);
					});
				})
				.catch(err => reject(err));
			})
			.catch(err => reject(err));
		});
	};

	// COUNT FUNCTIONS
	fn.holdings.count = function (holding_id, balance, user_id) {
		return new Promise((resolve, reject) => {
			fn.holding.get(holding_id)
			.then(holding => {
				let cash = fn.sessions.countCash(balance);
				holding.update({cash: cash})
				.then(result => {
					let state = (cash === holding.cash ?
						'correct' : 
						`${(holding.cash < cash ?
							'under' :
							'over'
						)}`
					);
					let variance = Math.abs(holding.cash - cash);

					create_action(
						holding.holding_id,
						`COUNT | Balance: £${Number(cash).toFixed(2)}. Holding ${state} | Variance: ${variance}`,
						user_id
					)
					.then(result => resolve(true));
				})
				.catch(err => reject(err));
			})
			.catch(err => reject(err));
		});
	};
};
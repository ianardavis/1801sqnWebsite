module.exports = function (m, fn) {
	fn.credits = {};
	fn.credits.get = function (credit_id) {
		return new Promise((resolve, reject) => {
			m.credits.findOne({
				where: {credit_id: credit_id}
			})
			.then(credit => {
				if (credit) {
					resolve(credit);
				} else {
					reject(new Error('Credit not found'));
				};
			})
			.catch(err => reject(err));
		});
	};
};
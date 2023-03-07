module.exports = function (m, fn) {
	fn.giftaid = {};
	fn.giftaid.get = function (where) {
		return new Promise((resolve, reject) => {
			m.giftaid.findOne({where: where})
			.then(giftaid => {
				if (giftaid) {
					resolve(giftaid);

				} else {
					reject(new Error('Giftaid record not found'));

				};
			})
			.catch(err => reject(err));
		});
	};
	fn.giftaid.getAll = function (where, pagination) {
		return new Promise((resolve, reject) => {
			m.giftaid.findAndCountAll({
				where: where,
				...pagination
			})
			.then(results => fn.send_res('giftaid', res, {rows: results}, req.query))
			.catch(err => fn.send_error(res, err));
		});
	};

	fn.giftaid.create = function (giftaid) {
		return new Promise((resolve, reject) => {
			if (giftaid) {
				m.giftaid.create(giftaid)
				.then(giftaid => resolve(giftaid))
				.catch(err => reject(err));

			} else {
				reject(new Error('No record'));

			};
		});
	};

	fn.giftaid.edit = function (giftaid_id, details) {
		return new Promise((resolve, reject) => {
			if (giftaid) {
				fn.giftaid.get({giftaid_id: giftaid_id})
				.then(giftaid => {
					giftaid.update(details)
					.then(result => {
						if (result) {
							resolve(true);

						} else {
							reject(new Error('Giftaid not updated'));
							
						};
					})
					.catch(err => reject(err));
				})
				.catch(err => reject(err));

			} else {
				reject(new Error('No record'));

			};
		});
	};
};
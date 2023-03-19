module.exports = function (m, fn) {
	fn.giftaid = {};
    fn.giftaid.get = function (where) {
        return fn.get(
            m.giftaid,
            where
        );
    };
	fn.giftaid.get_all = function (where, pagination) {
		return new Promise((resolve, reject) => {
			m.giftaid.findAndCountAll({
				where: where,
				...pagination
			})
			.then(results => resolve(results))
			.catch(err => reject(err));
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
module.exports = function (m, fn) {
	fn.giftaid = {};
    fn.giftaid.find = function (where) {
        return fn.find(
            m.giftaid,
            where
        );
    };
	fn.giftaid.findAll = function (query) {
		return new Promise((resolve, reject) => {
			m.giftaid.findAndCountAll({
				where: query.where,
				...fn.pagination(query)
			})
			.then(results => resolve(results))
			.catch(reject);
		});
	};

	fn.giftaid.create = function (giftaid) {
		return new Promise((resolve, reject) => {
			if (giftaid) {
				m.giftaid.create(giftaid)
				.then(giftaid => resolve(giftaid))
				.catch(reject);

			} else {
				reject(new Error('No record'));

			};
		});
	};

	fn.giftaid.edit = function (giftaid_id, details) {
		return new Promise((resolve, reject) => {
			if (giftaid) {
				fn.giftaid.find({giftaid_id: giftaid_id})
				.then(giftaid => {
					fn.update(giftaid, details)
					.then(result => resolve(true))
					.catch(reject);
				})
				.catch(reject);

			} else {
				reject(new Error('No record'));

			};
		});
	};
};
module.exports = function (m, fn) {
	fn.credits = {};
    fn.credits.find = function (where) {
        return fn.find(
            m.credits,
            where
        );
    };
	fn.credits.findAll = function (query) {
		return new Promise((resolve, reject) => {
			m.credits.findAndCountAll({
				include: [fn.inc.users.user()],
				...fn.pagination(query)
			})
			.then(results => resolve(results))
			.catch(reject);
		});
	};
};
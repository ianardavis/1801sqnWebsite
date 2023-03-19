module.exports = function (m, fn) {
	fn.credits = {};
    fn.credits.get = function (where) {
        return fn.get(
            m.credits,
            where
        );
    };
	fn.credits.get_All = function (pagination) {
		return new Promise((resolve, reject) => {
			m.credits.findAndCountAll({
				include: [fn.inc.users.user()],
				...pagination
			})
			.then(results => resolve(results))
			.catch(err => reject(err));
		});
	};
};
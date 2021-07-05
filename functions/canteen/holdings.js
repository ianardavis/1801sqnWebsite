module.exports = function (m, fn) {
    fn.holdings = {};
    fn.holdings.create = function (holding) {
        return new Promise((resolve, reject) => {
            if (!holding.description) reject(new Error('No description submitted'))
            else {
                m.holdings.findOrCreate({
                    where:    {description: holding.description},
                    defaults: {cash:        holding.cash || 0.0}
                })
                .then(([holding, created]) => {
                    if (!created) reject(new Error('This holding already exists'))
                    else resolve(true);
                })
                .catch(err => reject(err));
            };
        });
    };
};
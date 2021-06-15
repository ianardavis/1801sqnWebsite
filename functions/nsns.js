module.exports = function (m, fn) {
    fn.nsns = {};
    fn.nsns.get = function (nsn_id) {
        return new Promise((resolve, reject) => {
            return m.nsns.findOne({where: {nsn_id: nsn_id}})
            .then(nsn => {
                if (!nsn) reject(new Error('NSN not found'))
                else resolve(nsn);
            })
            .catch(err => reject(err));
        });
    };
};
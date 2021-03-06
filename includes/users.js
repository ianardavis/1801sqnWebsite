module.exports = (m, fn) => {
    fn.inc.users = {};
    fn.inc.users.user = (options = {}) => {
        return {
            model:      m.users,
            include:    [fn.inc.users.rank()],
            attributes: options.attributes || ['full_name'],
            as:         options.as || 'user'
        };
    };
    fn.inc.users.rank = () => {
        return {
            model:      m.ranks,
            attributes: ['rank'],
            as:         'rank'
        };
    };
    fn.inc.users.status = () => {
        return {
            model:      m.statuses,
            attributes: ['status'],
            as:         'status'
        };
    };
};
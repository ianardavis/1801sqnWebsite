module.exports = (m, fn) => {
    fn.inc.users = {};
    fn.inc.users.user = (options = {}) => {
        return {
            model:      m.users,
            include:    [fn.inc.users.rank()],
            attributes: options.attributes || ['user_id', 'full_name', 'rank_id'],
            as:         options.as || 'user',
            ...(options.where ? {where: options.where} : {})
        };
    };
    fn.inc.users.rank = () => {
        return {
            model:      m.ranks,
            attributes: ['rank'],
            as:         'rank'
        };
    };
    fn.inc.users.status = (where = null) => {
        return {
            model:      m.statuses,
            where:      where,
            attributes: ['status'],
            as:         'status'
        };
    };
};
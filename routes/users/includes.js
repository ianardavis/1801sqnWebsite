module.exports = (inc, m) => {
    inc.users = (options = {}) => {
        let include = [];
        if (options.include) options.include;
        include.push(inc.rank());
        return {
            model:      m.users,
            include:    include,
            attributes: options.attributes || {exclude: ['password', 'salt']},
            as:         options.as         || 'user',
            where:      options.where      || null,
            required:   options.required   || false
        };
    };
    inc.rank = () => {
        return {
            model:      m.ranks,
            attributes: ['rank'],
            as:         'rank'
        };
    };
    inc.status = () => {
        return {
            model:      m.statuses,
            attributes: ['status'],
            as:         'status'
        };
    };
};
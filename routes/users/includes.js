module.exports = (inc, m) => {
    inc.users = (options = {}) => {
        let include = [];
        if (options.include) options.include;
        include.push(inc.ranks());
        return {
            model:      m.users.users,
            include:    include,
            attributes: options.attributes || {exclude: ['_password', '_salt']},
            as:         options.as         || 'user',
            where:      options.where      || null,
            required:   options.required   || false
        };
    };
    inc.ranks = (options = {}) => {
        return {
            model:      m.users.ranks,
            attributes: options.attributes || ['rank_id', '_rank'],
            as:         options.as         || 'rank',
            include:    options.include    || [],
            required:   options.required   || false,
            where:      options.where      || null
        };
    };
    inc.statuses = (options = {}) => {
        return {
            model:      m.users.statuses,
            attributes: options.attributes || ['status_id', '_status'],
            as:         options.as         || 'status',
            include:    options.include    || [],
            required:   options.required   || false,
            where:      options.where      || null
        };
    };
};
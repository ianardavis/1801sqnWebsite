module.exports = {
    findOne: (options = {}) => new Promise((resolve, reject) => {
        options.table.findOne({
            where:      options.where,
            include:    options.include    || [],
            attributes: options.attributes || null
        })
        .then(result => {
            if (result) resolve(result)
            else reject(new Error('No record found in ' + options.table.tableName));
        })
        .catch(err => reject(err));
    }),
    update: (options = {}) => new Promise((resolve, reject) => {
        options.table.update(options.record, {where: options.where})
        .then(result => {
            if (result) resolve(result)
            else reject(new Error('Record not updated in ' + options.table));
        })
        .catch(err => reject(err));
    }),
    destroy: (options = {}) => new Promise((resolve, reject) => {
        console.log(options);
        options.table.destroy({where: options.where})
        .then(result => {
            console.log(result);
            if (result) resolve(true)
            else reject(new Error('Record not deleted from ' + options.table.tableName));
        })
        .catch(err => reject(err));
    }),
    preDeleteCheck: (table, query) => new Promise((resolve, reject) => {
        table.findOne({where: query})
        .then(results => {
            if (!results) resolve(true)
            else reject(new Error('Can not delete a record that has ' + table.replace('_', ' ')));
        })
        .catch(err => reject(err));
    }),
    nullify: record => {
        for (let [key, value] of Object.entries(record)) {
            if (value === '') record[key] = null;
        };
        return record;
    }
};
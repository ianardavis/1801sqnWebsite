module.exports = {
    get: function (options) {
        return new Promise(resolve => {
            let actions = [];
            options.forEach(option => {
                actions.push(
                    new Promise((resolve, reject) => {
                        option.table.findAll({include: option.include || []})
                        .then(results => resolve({table: option.table.tableName, success: true, result: results}))
                        .catch(err => {
                            console.log(err);
                            reject({table: option.table.tableName, success: false, result: err});
                        });
                    })
                );
            });
            Promise.allSettled(actions)
            .then(results => {
                let options = {};
                results.forEach(result => {
                    if (result.value.success) options[result.value.table] = (result.value.result);
                });
                resolve(options);
            })
            .catch(err => {
                console.log(err);
                resolve(null);
            })
        })
    }
};
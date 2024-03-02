const execSync = require('child_process').execSync;
module.exports = function (m, fn) {
    fn.op = require('sequelize').Op;
    fn.redirect = function(res, url, message = null) {
        // if (message) console.log(message);
        // console.trace(`Redirecting to: ${url}`);
        res.redirect(url);
    };
    fn.sendError = function (res, err) {
        if (err.message) console.error(err);
        res.send({success: false, message: err.message || err});
    };
    fn.sendRes = function (table, res, result, query, inc = []) {
        let _return = {
            success: true,
            result: {
                ...(result.count  ? {count:  result.count} : {}),
                ...(result.limit  ? {limit:  query.limit}  : {}),
                ...(result.offset ? {offset: query.offset} : {})
            }
        };
        if (result.rows) {
            _return.result[table] = result.rows;

        } else {
            _return.result[table] = result;
            
        };
        
        res.send(_return);
    };
    fn.allowed = function (user_id, _permission, allow = false) {
        return new Promise((resolve, reject) => {
            m.permissions.findOne({
                where: {
                    permission: _permission,
                    user_id:    user_id
                },
                attributes: ['permission']
            })
            .then(permission => {
                if (!permission) {
                    if (allow) {
                        resolve(false);
                    } else {
                        reject(new Error(`Permission denied: ${_permission}`));
                    };
                } else {
                    resolve(true);
                };
            })
            .catch(reject);
        });
    };
    fn.nullify = function (record) {
        for (let [key, value] of Object.entries(record)) {
            if (value === '') record[key] = null;
        };
        return record;
    };
    fn.printSize = function (size) {
        let text = [];
        ['1', '2', '3'].forEach(s => {
            if (size[`size${s}`]) text.push(size[`size${s}`]);
        });
        return text.join('/');
    };
    fn.printSizeText = function (item) {
        let text = [];
        ['1', '2', '3'].forEach(s => {
            if (item[`size_text${s}`]) text.push(item[`size_text${s}`]);
        });
        return text.join('/');
    };
    fn.printNSN = function (nsn, separator = '-') {
        if (nsn) {
            const nsn_group = String(nsn.nsn_group.code).padStart(2, '0');
            const nsn_class = String(nsn.nsn_class.code).padStart(2, '0');
            const nsn_country = String(nsn.nsn_country.code).padStart(2, '0');
            const nsn_number = nsn.item_number;
            return `${nsn_group}${nsn_class}${separator}${nsn_country}${separator}${nsn_number}`
        };
    };
    fn.pagination = function (query) {
        let pagination = {distinct: true};
        if (query.order ) pagination.order  = [query.order];
        if (query.limit ) pagination.limit  = query.limit;
        if (query.offset) pagination.offset = query.offset * query.limit || 0;
        return pagination;
    };
    fn.buildQuery = function (query) {
        let where = {};
        
        // so that following tests dont fail when trying to access keys of query.where
        if (!query.where) query.where = {};
        
        if (query.where.status && query.where.status.length > 0) {
            where.status = {
                [fn.op.or]: (
                    Array.isArray(query.where.status) ?
                        query.where.status :
                        [query.where.status]
                )
            };
        };
        if (query.where.site_id)       where.site_id       = query.where.site_id;
        if (query.where.scrap_id)      where.scrap_id      = query.where.scrap_id;
        if (query.where.supplier_id)   where.supplier_id   = query.where.supplier_id;
        if (query.where.user_id_issue) where.user_id_issue = query.where.user_id_issue;

        if (query.gt || query.lt) {
            if (query.gt && query.lt) {
                where.createdAt = {
                    [fn.op.between]: [query.gt.value, query.lt.value]
                }
            };
            if (query.gt && !query.lt) {
                where.createdAt = {
                    [fn.op.gt]: query.gt.value
                }
            };
            if (!query.gt && query.lt) {
                where.createdAt = {
                    [fn.op.lt]: query.lt.value
                }
            };
        };
        return where;
    };
    fn.publicFile = function (folder, file) {
        return `${process.env.ROOT}/public/res/${folder}/${file}`;
    };
    fn.publicFolder = function (folder) {
        return `${process.env.ROOT}/public/res/${folder}`;
    };
    fn.runCommand = function (cmd) {
        return execSync(cmd, { encoding: 'utf-8' });
    };
    fn.checkLines = function (lines) {
        return new Promise((resolve, reject) => {
            if (!lines) {
                reject(new Error('No lines submitted'));
                
            } else {
                const submitted = lines.filter(e => e.status !== '' && e.status !== 'on').length;
                if (submitted === 0) {
                    reject(new Error('No lines submitted'));
                    
                } else {
                    resolve([lines, submitted]);
                };
            };
        });
    };
    fn.actionLines = function ([actions, submitted]) {
        return new Promise((resolve, reject) => {
            Promise.allSettled(actions)
            .then(fn.logRejects)
            .then(results => {
                const resolved = results.filter(e => e.status ==='fulfilled').length;
                const message = `${resolved} of ${submitted} tasks completed`;
                resolve(message)
            })
            .catch(reject);
        });
    };
    
    fn.logRejects = function (results) {
        results.filter(e => e.status === 'rejected').forEach(e => console.error(e));
        return results;
    };
    fn.find = function(table, where, include = []) {
        return new Promise((resolve, reject) => {
            table.findOne({
                where: where,
                include: include
            })
            .then(result => {
                if (result) {
                    resolve(result);

                } else {
                    reject(new Error(`${table.tableName} not found`));

                };
            })
            .catch(reject);
        });
    };
    fn.update = function (record, details, return_value = true) {
        return new Promise((resolve, reject) => {
            record.update(details)
            .then(result => {
                if (result) {
                    resolve(return_value);

                } else {
                    reject(new Error('Record not updated'));

                };
            })
            .catch(reject);
        });
    };
    fn.destroy = function (record) {
        return new Promise((resolve, reject) => {
            record.destroy()
            .then(result => {
                if (result) {
                    resolve(true);
                    
                } else {
                    reject(new Error('Record not deleted'));
                    
                };
            })
            .catch(reject);
        });
    };
    fn.checkResults = function (results) {
        let return_result = [];
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                return_result.push(result.value);

            } else {
                console.error(result.message);

            };
        });
        return return_result;
    };
};
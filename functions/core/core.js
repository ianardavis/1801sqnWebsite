const execSync = require('child_process').execSync;
module.exports = function (m, fn) {
    fn.op = require('sequelize').Op;
    fn.send_error = function (res, err) {
        if (err.message) console.log(err);
        res.send({success: false, message: err.message || err});
    };
    fn.send_res = function (table, res, result, query, inc = []) {
        let _return = {success: true, result: {}};
        if (result.rows) {
            _return.result[table] = result.rows;
        } else {
            _return.result[table] = result;
        };

        if (result.count) {
            _return.result.count  = result.count;
        };

        if (query.limit) {
            _return.result.limit  = query.limit;
        };

        if (query.offset) {
            _return.result.offset = query.offset;
        };

        inc.forEach(i => _return.result[i.name] = i.obj);
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
            .catch(err => reject(err));
        });
    };
    fn.nullify = function (record) {
        for (let [key, value] of Object.entries(record)) {
            if (value === '') record[key] = null;
        };
        return record;
    };
    fn.print_size = function (size) {
        let text = [];
        ['1', '2', '3'].forEach(s => {
            if (size[`size${s}`]) text.push(size[`size${s}`]);
        });
        return text.join('/');
    };
    fn.print_size_text = function (item) {
        let text = [];
        ['1', '2', '3'].forEach(s => {
            if (item[`size_text${s}`]) text.push(item[`size_text${s}`]);
        });
        return text.join('/');
    };
    fn.print_nsn = function (nsn) {
        if (nsn) {
            const nsn_group = String(nsn.nsn_group.code).padStart(2, '0');
            const nsn_class = String(nsn.nsn_class.code).padStart(2, '0');
            const nsn_country = String(nsn.nsn_country.code).padStart(2, '0');
            const nsn_number = nsn.item_number;
            return `${nsn_group}${nsn_class}-${nsn_country}-${nsn_number}`
        };
    };
    fn.pagination = function (query) {
        let pagination = {};
        if (query.order ) pagination.order  = [query.order];
        if (query.limit ) pagination.limit  = query.limit;
        if (query.offset) pagination.offset = query.offset * query.limit || 0;
        return pagination;
    };
    fn.build_query = function (query) {
        let where = {};
        if (!query.where) {
            query.where = {};
        };
        
        if (query.where.status && query.where.status.length > 0) {
            where.status = {
                [fn.op.or]: (
                    Array.isArray(query.where.status) ?
                        query.where.status :
                        [query.where.status]
                )
            };
        };
        
        if (query.where.supplier_id) {
            where.supplier_id = query.where.supplier_id;
        };
        
        if (query.where.user_id_issue) {
            where.user_id_issue = query.where.user_id_issue;
        };

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
    fn.allSettledResults = function (results) {
        let noErrors = true;
        results.filter(e => e.status === 'rejected').forEach(e => {
            noErrors = false;
            console.log(e);
        });
        return noErrors;
    };
    fn.public_file = function (folder, file) {
        return `${process.env.ROOT}/public/res/${folder}/${file}`;
    };
    fn.run_cmd = function (cmd) {
        return execSync(cmd, { encoding: 'utf-8' });
    };
    fn.check_for_valid_lines_to_update = function (lines) {
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
};
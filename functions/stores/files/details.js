module.exports = function ( m, fn ) {
    fn.files.details.find = function (where) {
        return fn.find(
            m.file_details,
            where
        );
    };
    fn.files.details.findAll = function ( query ) {
        return new Promise( ( resolve, reject ) => {
            m.file_details.findAndCountAll({
                where: query.where,
                ...fn.pagination( query )
            })
            .then(results => resolve(results))
            .catch( reject );
        });
    };

    fn.files.details.create = function (details, user_id) {
        return new Promise( ( resolve, reject ) => {
            fn.files.find({file_id: details.file_id})
            .then(file => {
                m.file_details.findOrCreate({
                    where: {
                        file_id: details.file_id,
                        name:    details.name
                    },
                    defaults: {
                        value: details.value,
                        user_id: user_id
                    }
                })
                .then(([detail, created]) => {
                    if (created) {
                        resolve(true);

                    } else {
                        fn.update(
                            detail,
                            {
                                value:   details.value,
                                user_id: user_id
                            }
                        )
                        .then(result => resolve(true))
                        .catch( reject );

                    };
                })
                .catch( reject );
            })
            .catch( reject );
        });
    };

    fn.files.details.edit = function (file_detail_id, details) {
        return new Promise( ( resolve, reject ) => {
            fn.files.details.find({file_detail_id: file_detail_id})
            .then(file_detail => {
                fn.update(file_detail, details)
                .then(result => resolve(result))
                .catch( reject );
            })
            .catch( reject );
        });
    };

    fn.files.details.delete = function (file_detail_id) {
        return new Promise( ( resolve, reject ) => {
            m.file_details.destroy({
                where: {file_detail_id: file_detail_id}
            })
            .then(result => {
                if (result) {
                    resolve(true);
    
                } else {
                    reject(new Error('Detail not deleted'));
                
                };
            })
            .catch( reject );
        });
    };
};
module.exports = function (m, fn) {
    fn.site.links.headings.findAll = function (query) {
        return new Promise((resolve, reject) => {
            m.resource_link_headings.findAndCountAll({
                where: query.where,
                ...fn.pagination(query)
            })
            .then(resolve)
            .catch(reject);
        });
    };

    fn.site.links.headings.find = function (where) {
        return fn.find(
            m.resource_link_headings,
            where,
        );
    };
    fn.site.links.headings.create = function (heading) {
        return new Promise((resolve, reject) => {
            m.resource_link_headings.create(heading)
            .then(resolve)
            .catch(reject);
        });
    };
    fn.site.links.headings.edit = function (resource_link_heading_id, details) {
        function update_heading(heading) { return fn.update(heading, details); };
        return new Promise((resolve, reject) => {
            fn.site.links.headings.find({ resource_link_heading_id: resource_link_heading_id })
            .then(update_heading)
            .then(resolve)
            .catch(reject);
        });
    };
    fn.site.links.headings.delete = function (resource_link_heading_id) {
        return new Promise((resolve, reject) => {
            fn.site.links.headings.find({resource_link_heading_id: resource_link_heading_id})
            .then(heading => {
                heading.destroy()
                .then(result => {
                    if (result) {
                        resolve(true);

                    } else {
                        reject(new Error('Heading not deleted'));

                    };
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };
};
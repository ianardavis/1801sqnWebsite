module.exports = function (m, fn) {
    fn.site = {links: {}};
    fn.site.links.get_all = function (where) {
        return new Promise((resolve, reject) => {
            m.resource_links.findAll({
                where: where
            })
            .then(links => resolve(links))
            .catch(reject);
        });
    };

    fn.site.links.get = function (where) {
        return fn.get(
            m.resource_links,
            where,
        );
    };
    fn.site.links.create = function (link) {
        return new Promise((resolve, reject) => {
            m.resource_links.create(link)
            .then(link => resolve(link))
            .catch(reject);
        });
    };
    fn.site.links.edit = function (resource_link_id, details) {
        function update_link(link) { return fn.update(link, details); };
        return new Promise((resolve, reject) => {
            fn.site.links.get({ resource_link_id: resource_link_id })
            .then(update_link)
            .then(result => resolve(true))
            .catch(reject);
        });
    };
    fn.site.links.delete = function (resource_link_id) {
        return new Promise((resolve, reject) => {
            fn.site.links.get({resource_link_id: resource_link_id})
            .then(link => {
                link.destroy()
                .then(result => {
                    if (result) {
                        resolve(true);

                    } else {
                        reject(new Error('Link not deleted'));

                    }
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };
};
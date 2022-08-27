module.exports = function (m, fn) {
    fn.nsns = {classes: {}, groups: {}, countries: {}};
    fn.nsns.get = function (nsn_id) {
        return m.nsns.findOne({
            where: {nsn_id: nsn_id},
            include: [fn.inc.stores.size()]
        });
    };
    fn.nsns.classes.get = function (nsn_class_id) {
        return m.nsn_classes.findOne({where: {nsn_class_id: nsn_class_id}});
    };
    fn.nsns.groups.get = function (nsn_group_id) {
        return m.nsn_groups.findOne({where: {nsn_group_id: nsn_group_id}});
    };
    fn.nsns.countries.get = function (nsn_country_id) {
        return m.nsn_countries.findOne({where: {nsn_country_id: nsn_country_id}});
    };
};
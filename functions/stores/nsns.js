module.exports = function (m, fn) {
    fn.nsns = {classes: {}, groups: {}, countries: {}};
    fn.nsns.get = function (nsn_id) {
        return fn.get(
            'nsns',
            {nsn_id: nsn_id},
            [{
                model: m.sizes,
                include: [m.items]
            }]
        )
    };
    fn.nsns.classes.get = function (nsn_class_id) {
        return fn.get(
            'nsn_classes',
            {nsn_class_id: nsn_class_id}
        )
    };
    fn.nsns.groups.get = function (nsn_group_id) {
        return fn.get(
            'nsn_groups',
            {nsn_group_id: nsn_group_id}
        )
    };
    fn.nsns.countries.get = function (nsn_country_id) {
        return fn.get(
            'nsn_countries',
            {nsn_country_id: nsn_country_id}
        )
    };
};
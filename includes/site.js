module.exports = (m, fn) => {
    fn.inc.site = {};
    fn.inc.site.gallery = () => {
        return {
            model: m.galleries,
            as:    'gallery'
        };
    };
};
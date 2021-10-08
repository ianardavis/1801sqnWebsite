module.exports = function (m) {
    m.gallery_images.belongsTo(m.galleries, {foreignKey: 'gallery_id', targetKey: 'gallery_id'});
};
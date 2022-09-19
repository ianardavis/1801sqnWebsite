module.exports = function (m) {
    m.gallery_images.belongsTo(
        m.galleries,
        {
            foreignKey: 'gallery_id',
            targetKey:  'gallery_id'
        }
    );
    
    m.gallery_images.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id',
            constraints: false
        }
    );

    m.galleries.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id',
            constraints: false
        }
    );
};
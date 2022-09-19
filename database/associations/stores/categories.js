module.exports = function (m) {
    m.categories.hasMany(
        m.categories, 
        {
            foreignKey: 'category_id_parent',
            sourceKey:  'category_id',
            as: 'children'
        }
    );

    m.categories.belongsTo(
        m.categories,
        {
            foreignKey: 'category_id_parent',
            targetKey:  'category_id',
            as: 'parent'
        }
    );
};
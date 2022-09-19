module.exports = function (m) {
    m.items.hasOne(
        m.genders,
        {
            foreignKey: 'gender_id',
            sourceKey:  'gender_id',
            constraints: false
        }
    );

    m.items.hasMany(
        m.sizes,
        {
            foreignKey: 'item_id',
            targetKey:  'item_id'
        }
    );

    m.items.hasMany(
        m.item_attributes,
        {
            foreignKey: 'item_id',
            targetKey:  'item_id',
            as: 'attributes'
        }
    );

    m.items.hasMany(
        m.item_categories,
        {
            foreignKey: 'item_id',
            targetKey:  'item_id'
        }
    );

    m.items.belongsToMany(
        m.genders,
        {
            through: m.item_genders,
            foreignKey:'item_id'
        }
    );

    m.embodiments.hasOne(
        m.sizes,
        {
            foreignKey: 'size_id',
            sourceKey:  'size_id_parent',
            constraints: false,
            as: 'parent'
        }
    );

    m.embodiments.hasOne(
        m.sizes,
        {
            foreignKey: 'size_id',
            sourceKey:  'size_id_child',
            constraints: false,
            as: 'child'
        }
    );

    m.item_categories.hasOne(
        m.categories,
        {
            foreignKey: 'category_id',
            sourceKey:  'category_id',
            constraints: false
        }
    );

    m.item_categories.belongsTo(
        m.items,
        {
            foreignKey: 'item_id',
            targetKey:  'item_id'
        }
    );
};
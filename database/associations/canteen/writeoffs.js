module.exports = function (m) {
    m.writeoffs.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id',
            constraints: false
        }
    );

    m.writeoffs.hasOne(
        m.canteen_items,
        {
            foreignKey: 'item_id',
            sourceKey:  'item_id',
            as: 'item',
            constraints: false
        }
    );
};
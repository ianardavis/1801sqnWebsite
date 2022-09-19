module.exports = function (m) {
    m.credits.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id',
            constraints: false
        }
    );
};
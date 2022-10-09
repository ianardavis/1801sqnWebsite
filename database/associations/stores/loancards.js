module.exports = function (m) {
    m.loancards.hasMany(
        m.loancard_lines, 
        {
            foreignKey: 'loancard_id',
            sourceKey:  'loancard_id',
            as: 'lines'
        }
    );

    m.loancard_lines.hasOne(
        m.sizes, 
        {
            foreignKey: 'size_id',
            sourceKey:  'size_id',
            constraints: false
        }
    );

    m.loancard_lines.hasOne(
        m.serials, 
        {
            foreignKey: 'serial_id',
            sourceKey:  'serial_id',
            constraints: false
        }
    );

    m.loancard_lines.belongsTo(
        m.loancards, 
        {
            foreignKey: 'loancard_id',
            targetKey:  'loancard_id'
        }
    );

    m.loancard_lines.hasOne(
        m.nsns, 
        {
            foreignKey: 'nsn_id',
            sourceKey:  'nsn_id',
            constraints: false
        }
    );

    m.loancard_lines.belongsToMany(
        m.issues, 
        {
            through: m.issue_loancard_lines,
            foreignKey:'loancard_line_id'
        }
    );

    m.loancards.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id_loancard',
            constraints: false,
            as: 'user_loancard'
        }
    );

    m.loancards.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id',
            constraints: false
        }
    );

    m.loancard_lines.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id',
            constraints: false
        }
    );
    }; 
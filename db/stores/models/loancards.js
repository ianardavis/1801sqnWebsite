/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('loancards', {
    'loancard_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'user_id_loancard': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    'user_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_date_due': {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "null"
    },
    '_filename': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    '_status': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '1',
      comment: "null"
    },
    'updatedAt': {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "null"
    },
    'createdAt': {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "null"
    }
  }, {
    tableName: 'loancards',
    schema: 'stores'
  });
};

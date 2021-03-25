/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('loancards', {
    'loancard_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'user_id_loancard': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'user_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'date_due': {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "null"
    },
    'filename': {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "null"
    },
    'status': {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: '1',
      comment: "null"
    },
    'createdAt': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    },
    'updatedAt': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    }
  }, {
    tableName: 'loancards',
    schema: 'stores'
  });
};

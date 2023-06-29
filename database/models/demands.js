/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('demands', {
    'demand_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'supplier_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'status': {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: '1',
      comment: "null"
    },
    'filename': {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "null"
    },
    'account_id': {
      type: DataTypes.UUIDV4,
      allowNull: true,
      comment: "null"
    },
    'user_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
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
    tableName: 'demands',
    schema: 'stores'
  });
};

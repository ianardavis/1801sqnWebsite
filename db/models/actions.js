/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('actions', {
    'action_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'issue_id': {
      type: DataTypes.UUIDV4,
      allowNull: true,
      comment: "null"
    },
    'order_id': {
      type: DataTypes.UUIDV4,
      allowNull: true,
      comment: "null"
    },
    'action': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'stock_id': {
      type: DataTypes.UUIDV4,
      allowNull: true,
      comment: "null"
    },
    'serial_id': {
      type: DataTypes.UUIDV4,
      allowNull: true,
      comment: "null"
    },
    'location_id': {
      type: DataTypes.UUIDV4,
      allowNull: true,
      comment: "null"
    },
    'nsn_id': {
      type: DataTypes.UUIDV4,
      allowNull: true,
      comment: "null"
    },
    'loancard_line_id': {
      type: DataTypes.UUIDV4,
      allowNull: true,
      comment: "null"
    },
    'demand_line_id': {
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
    },
    'loancard_id': {
      type: DataTypes.UUIDV4,
      allowNull: true,
      comment: "null"
    },
    'demand_id': {
      type: DataTypes.UUIDV4,
      allowNull: true,
      comment: "null"
    }
  }, {
    tableName: 'actions',
    schema: 'stores'
  });
};

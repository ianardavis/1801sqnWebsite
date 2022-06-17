/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('payments', {
    'payment_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'sale_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'amount': {
      type: DataTypes.DOUBLE,
      allowNull: false,
      comment: "null"
    },
    'type': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'user_id_payment': {
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
    'status': {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: '1',
      comment: "null"
    }
  }, {
    tableName: 'payments',
    schema: 'canteen'
  });
};

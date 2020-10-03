/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('suppliers', {
    'supplier_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    '_name': {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "null"
    },
    '_address1': {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "null"
    },
    '_address2': {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "null"
    },
    '_address3': {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "null"
    },
    '_address4': {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "null"
    },
    '_address5': {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "null"
    },
    '_telephone': {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "null"
    },
    '_email': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    '_stores': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "null"
    },
    'account_id': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    'file_id': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    'createdAt': {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('current_timestamp'),
      comment: "null"
    },
    'updatedAt': {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('current_timestamp'),
      comment: "null"
    }
  }, {
    tableName: 'suppliers'
  });
};

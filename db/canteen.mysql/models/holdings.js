/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('holdings', {
    'holding_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    '_description': {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: "null"
    },
    '_cash': {
      type: DataTypes.DECIMAL,
      allowNull: false,
      comment: "null"
    },
    '_cheques': {
      type: DataTypes.DECIMAL,
      allowNull: false,
      comment: "null"
    },
    'createdAt': {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "null"
    },
    'updatedAt': {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "null"
    }
  }, {
    tableName: 'holdings',
    schema: 'canteen'
  });
};

/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('files', {
    'file_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    '_path': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null",
      unique: true
    },
    '_code': {
      type: DataTypes.STRING(4),
      allowNull: true,
      comment: "null"
    },
    '_rank': {
      type: DataTypes.STRING(4),
      allowNull: true,
      comment: "null"
    },
    '_name': {
      type: DataTypes.STRING(4),
      allowNull: true,
      comment: "null"
    },
    '_sqn': {
      type: DataTypes.STRING(4),
      allowNull: true,
      comment: "null"
    },
    '_rank_column': {
      type: DataTypes.STRING(2),
      allowNull: true,
      comment: "null"
    },
    '_name_column': {
      type: DataTypes.STRING(2),
      allowNull: true,
      comment: "null"
    },
    '_request_start': {
      type: DataTypes.STRING(2),
      allowNull: true,
      comment: "null"
    },
    '_request_end': {
      type: DataTypes.STRING(2),
      allowNull: true,
      comment: "null"
    },
    '_date': {
      type: DataTypes.STRING(4),
      allowNull: true,
      comment: "null"
    },
    '_cover_sheet': {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "null"
    },
    '_items_sheet': {
      type: DataTypes.STRING(20),
      allowNull: true,
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
    tableName: 'files',
    schema: 'stores'
  });
};

/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('action_links', {
    'action_link_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'action_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    '_table': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'id': {
      type: DataTypes.UUIDV4,
      allowNull: true,
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
    tableName: 'action_links',
    schema: 'core'
  });
};

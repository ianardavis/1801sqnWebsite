/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('permissions', {
    'user_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      comment: "null"
    },
    'account_enabled': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '1',
      comment: "User"
    },
    'access_settings': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Admin"
    },
    'settings_edit': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Admin"
    },
    'settings_dropdown': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Admin"
    },
    'settings_dropdown_add': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Admin"
    },
    'settings_dropdown_edit': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Admin"
    },
    'settings_dropdown_delete': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Admin"
    },
    'access_issues': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Issuer"
    },
    'access_items': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Issuer"
    },
    'access_locations': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Issuer"
    },
    'access_nsns': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Issuer"
    },
    'item_add': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Storeman"
    },
    'item_edit': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Storeman"
    },
    'item_delete': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Super"
    },
    'item_size_add': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Storeman"
    },
    'item_size_delete': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Admin"
    },
    'item_locations_add': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Storeman"
    },
    'item_locations_edit': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Storeman"
    },
    'item_locations_delete': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Storeman"
    },
    'item_nsn_add': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Storeman"
    },
    'item_nsn_edit': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Storeman"
    },
    'item_nsn_delete': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Admin"
    },
    'item_receive': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Storeman"
    },
    'item_count': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Storeman"
    },
    'item_scrap': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Storeman"
    },
    'item_stocktake': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Storeman"
    },
    'issues_add': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Issuer"
    },
    'issues_edit': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Admin"
    },
    'issues_return': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Issuer"
    },
    'issues_delete': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Super"
    },
    'access_users': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Admin"
    },
    'users_add': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Admin"
    },
    'users_edit': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Admin"
    },
    'users_permissions': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Admin"
    },
    'users_delete': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Super"
    },
    'users_password': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Admin"
    },
    'users_status': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Admin"
    },
    'users_others': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Admin"
    },
    'access_notes': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Issuer"
    },
    'notes_add': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Issuer"
    },
    'notes_edit': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Admin"
    },
    'notes_delete': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Super"
    },
    'access_requests': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '1',
      comment: "User"
    },
    'requests_add': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '1',
      comment: "User"
    },
    'requests_edit': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Issuer"
    },
    'requests_delete': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Super"
    },
    'requests_approve': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Storeman"
    },
    'access_orders': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Storeman"
    },
    'orders_add': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Storeman"
    },
    'orders_edit': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Storeman"
    },
    'orders_place': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Storeman"
    },
    'orders_delete': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "null"
    },
    'access_demands': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Storeman"
    },
    'demands_raise': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Storeman"
    },
    'demands_search': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Storeman"
    },
    'access_suppliers': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Admin"
    },
    'suppliers_add': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Admin"
    },
    'suppliers_edit': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Admin"
    },
    'suppliers_delete': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Super"
    },
    'suppliers_search': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Admin"
    },
    'access_loancards': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Issuer"
    },
    'access_reports': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Storeman"
    },
    'access_print': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "Issuer"
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
    tableName: 'permissions'
  });
};

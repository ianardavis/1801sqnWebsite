function getResult(table) {
    get({
        table: table,
        query: [`${table}_id=${path[2]}`]
    })
    .then(function ([result, options]) {
        set_innerText({id: `user_${table}`, text: print_user(result[`user_${table}`])});
        set_innerText({id: 'user',          text: print_user(result.user)});
        set_innerText({id: 'createdAt',     text: print_date(result.createdAt, true)});
        set_innerText({id: 'updatedAt',     text: print_date(result.updatedAt, true)});
        set_innerText({id: '_status',       text: statuses[result._status]});
        set_href({id: `user_${table}_link`, value: `/stores/users/${result[`user_${table}`]}`});
        set_href({id: 'user_link',          value: `/stores/users/${result.user_id}`});
        set_breadcrumb({text: result[`${table}_id`]});
    });
};
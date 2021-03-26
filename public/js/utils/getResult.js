function getResult(table) {
    get(
        {
            table: table,
            query: [`${table}_id=${path[2]}`]
        },
        function (result, options) {
            set_innerText({id: `user_${table}`,      text: print_user(result[`user_${table}`])});
            set_innerText({id: 'user',               text: print_user(result.user)});
            set_attribute({id: `user_${table}_link`, attribute: 'href', value: `/stores/users/${result[`user_${table}`]}`});
            set_attribute({id: 'user_link',          attribute: 'href', value: `/stores/users/${result.user_id}`});
            set_innerText({id: 'createdAt',          text: print_date(result.createdAt, true)});
            set_innerText({id: 'updatedAt',          text: print_date(result.updatedAt, true)});
            set_innerText({id: '_status',            text: statuses[result._status]});
            set_breadcrumb({
                text: result[`${table}_id`],
                href: `/stores/${table}s/${result[`${table}_id`]}`
            });
        }
    );
};
// document.querySelector('#reload').addEventListener('click', getResult);
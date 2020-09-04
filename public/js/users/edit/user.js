showItem = (items, options) => {
    if (items.length === 1) {
        ['_description', '_size_text'].forEach(field => {
            let _text = document.querySelector(`#${field}`);
            _text.value = users[0][field];
        });
        // if (users[0].category_id) {
        //     get(showOptions, {table: 'categories', query: [], singular: 'category', selected: users[0].category_id})
        //     .then(result => {
        //         if (users[0].group_id) {
        //             get(showOptions, {table: 'groups', query: [`category_id=${users[0].category_id}`], singular: 'group', selected: users[0].group_id})
        //             .then(result => {
        //                 if (users[0].type_id) {
        //                     get(showOptions, {table: 'types', query: [`group_id=${users[0].group_id}`], singular: 'type', selected: users[0].type_id})
        //                     .then(result => {
        //                         if (users[0].subtype_id) {
        //                             get(showOptions, {table: 'subtypes', query: [`type_id=${users[0].type_id}`], singular: 'subtype', selected: users[0].subtype_id});
            
        //                         } else get(showOptions, {table: 'subtypes', query: [`type_id=${users[0].type_id}`], singular: 'subtype'});
        //                     });
        //                 } else get(showOptions, {table: 'types', query: [`group_id=${users[0].group_id}`], singular: 'type'});
        //             });
        //         } else get(showOptions, {table: 'groups', query: [`category_id=${users[0].category_id}`], singular: 'group'});
        //     });
        // } else get(showOptions, {table: 'categories', query: [], singular: 'category'});

        // if (users[0].gender_id) {
        //     get(showOptions, {table: 'genders', query: [], singular: 'gender', selected: users[0].gender_id});
        // } else get(showOptions, {table: 'genders', query: [], singular: 'gender'});
    } else alert(`${items.length} matching items found`);
};

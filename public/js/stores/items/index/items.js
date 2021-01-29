function getItems() {
    let sel_genders = document.querySelector('#sel_genders') || {value: ''};
    get(
        function (items, options) {
            clearElement('tbl_items');
            let table_body = document.querySelector('#tbl_items');
            items.forEach(item => {
                let row = table_body.insertRow(-1);
                add_cell(row, {
                    text: item._description,
                    classes: ['search']
                });
                add_cell(row, {append: new Link({
                    href: `/stores/items/${item.item_id}`,
                    small: true
                }).e});
            });
        },
        {
            table: 'items',
            query: [sel_genders.value]
        }
    )
};
function getGenders() {
	let sel_genders = document.querySelector('#sel_genders');
	if (sel_genders) {
		get(
			function (genders, options) {
				sel_genders.innerHTML= '';
				sel_genders.appendChild(new Option({text: 'All', selected: true}).e);
				genders.forEach(gender => {
					sel_genders.appendChild(
						new Option({
							text: gender._gender,
							value: `gender_id=${gender.gender_id}`
						}).e
					)
				});
				getItems();
			},
			{
				table: 'genders',
				query: []
			}
		);
	} else getItems();
};
document.querySelector('#reload')     .addEventListener('click',  getItems);
document.querySelector('#sel_genders').addEventListener('change', getItems);
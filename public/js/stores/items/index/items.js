function getItems() {
    let sel_genders = document.querySelector('#sel_genders') || {value: ''};
    get(
        {
            table: 'items',
            query: [sel_genders.value]
        },
        function (items, options) {
            let tbl_items = document.querySelector('#tbl_items');
            if (tbl_items) {
                items.forEach(item => {
                    let row = tbl_items.insertRow(-1);
                    add_cell(row, {
                        text: item._description,
                        classes: ['search']
                    });
                    add_cell(row, {append: new Link({
                        href: `/stores/items/${item.item_id}`,
                        small: true
                    }).e});
                });
            };
        }
    );
};
function getGenders() {
	let sel_genders = document.querySelector('#sel_genders');
	if (sel_genders) {
		get(
			{
				table: 'genders',
				query: []
			},
			function (genders, options) {
				sel_genders.innerHTML= '';
				sel_genders.appendChild(new Option({text: 'All', selected: true}).e);
				genders.forEach(gender => {
					sel_genders.appendChild(
						new Option({
							text:  gender._gender,
							value: `gender_id=${gender.gender_id}`
						}).e
					)
				});
				getItems();
			}
		);
	} else getItems();
};
document.querySelector('#reload')        .addEventListener('click',  getItems);
document.querySelector('#reload_genders').addEventListener('click',  getGenders);
document.querySelector('#sel_genders')   .addEventListener('change', getItems);
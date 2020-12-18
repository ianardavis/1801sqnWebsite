function getStocks() {
    get(
        function (stocks, options) {
            try {
                let tbl_stock = document.querySelector('#tbl_stock');
                set_count({id: 'stock', count: stocks.length});
                if (tbl_stock) {
                    tbl_stock.innerHTML = '';
                    stocks.forEach(stock => {
                        let row = tbl_stock.insertRow(-1);
                        add_cell(row, {text: stock.location._location});
                        add_cell(row, {text: stock._qty});
                        add_cell(row, {append: new Link({
                            modal: 'stock_view',
                            data:  {field: 'stock_id', value: stock.stock_id},
                            small: true
                        }).e}
                        );
                    });
                };
            } catch (error) {console.log(error)};
        },
        {
            table: 'stocks',
            query: [`size_id=${path[3]}`]
        }
    );
};
function getStockNotes(stock_id) {
    get(
        function(notes, options) {
            let tbl_stock_notes = document.querySelector('#tbl_stock_notes');
            if (tbl_stock_notes) {
                tbl_stock_notes.innerHTML = '';
                set_count({id: 'stock_note', count: notes.length});
                notes.forEach(note => {
                    let row = tbl_stock_notes.insertRow(-1);
                    add_cell(row, {
                        text: print_date(note.createdAt, true),
                        sort: new Date (note.createdAt).getTime()
                    });
                    if (note._system === 1) add_cell(row, {html: '<i class="fas fa-check"></i>'})
                    else                    add_cell(row);
                    add_cell(row, {text: note._note});
                    add_cell(row, {text: print_user(note.user)});
                    add_cell(row, {append: new Link({type: 'edit', small: true}).e});
                    add_cell(row, {append: new Delete_Button({
                        descriptor: 'note',
                        small: true,
                        path: `/stores/notes/${note.note_id}`,
                        options: {
                            onComplete: getStockNotes,
                            args: [stock_id]
                        }
                    }).e});
                });
            }
        },
        {
            table: 'notes',
            query: ['_table=stocks',`_id=${stock_id}`]
        }
    );
};
function getStockView(stock_id, permissions) {
    get(
        function(stock, options) {
            set_innerText({id: 'stock_location', text: stock.location._location});
            set_innerText({id: '_stock_view',    text: stock._stock});
            if (permissions.edit === true || permissions.delete === true) {
                let stock_buttons = document.querySelector('#stock_buttons');
                if (stock_buttons) {
                    stock_buttons.innerHTML = '';
                    if (permissions.delete) {
                        stock_buttons.appendChild(
                            new Delete_Button({
                                path:       `/stores/stocks/${stock.stock_id}`,
                                descriptor: 'Stock',
                                float:      true,
                                options: {
                                    onComplete: [
                                        getStocks,
                                        function () {$('mdl_stock_view').modal('hide')}
                                    ]
                                }
                            }).e
                        );
                    };
                    if (permissions.edit) {
                        stock_buttons.appendChild(
                            new Button({
                                id:   'btn_stock_edit',
                                type: 'success',
                                html: '<i class="fas fa-pencil-alt"></i>',
                                click: edit_stock
                            }).e
                        );
                    };
                };
            };
        },
        {
            table: 'stock',
            query: [`stock_id=${stock_id}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getStocks);
$('#mdl_stock_view').on('show.bs.modal', function(event) {getStockNotes(event.relatedTarget.dataset.stock_id)});
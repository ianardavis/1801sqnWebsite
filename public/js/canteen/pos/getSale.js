function getSale() {
    get(
        {
            db: 'canteen',
            table: 'user_sale',
            query: []
        },
        function (_sale_id, options) {
            if (_sale_id) {
                let breadcrumb = document.querySelector('#breadcrumb');
                if (breadcrumb) breadcrumb.innerText = _sale_id;
                sale_id = _sale_id;
                sale_loaded = true;
                load_check();
            } else alert('Sale not found');
        }
    );
};
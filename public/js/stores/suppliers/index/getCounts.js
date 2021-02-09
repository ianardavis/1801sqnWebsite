function getCounts() {
    document.querySelectorAll('.item-counts').forEach(e => {
        count(
            {
                table: 'sizes',
                query: [`supplier_id=${e.dataset.id}`]
            },
            function (count, options) {
                e.innerText = count;
            }
        );
    });
};
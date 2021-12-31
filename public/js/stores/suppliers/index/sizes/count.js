function getCounts() {
    document.querySelectorAll('.card-body').forEach(e => {
        get({
            action: 'count',
            table: 'sizes',
            where: {supplier_id: e.dataset.id}
        })
        .then(function ([count, options]) {
            let p = document.createElement('p');
            p.classList.add('text-start', 'f-10');
            p.innerText = `Items: ${count}`;
            e.appendChild(p);
        });
    });
};
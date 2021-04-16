function detailDeleteBtns() {
    document.querySelectorAll('.details').forEach(e => {
        get(
            {
                table: 'detail',
                query: [`detail_id=${e.dataset.id}`]
            },
            function(detail, options) {
                e.appendChild(
                    new Delete_Button({
                        descriptor: 'detail',
                        path:       `/details/${detail.detail_id}`,
                        small:      true,
                        options:    {onComplete: getDetails}
                    }).e
                );
                e.removeAttribute('data-id');
                e.removeAttribute('class');
            }
        );
    });
};
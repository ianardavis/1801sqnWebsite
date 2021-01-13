function setButtons() {
    get(
        function(result, options) {
            set_attribute({id: `btn_delete`, attribute: 'disabled', value: true});
            if (result._status === 1 || result._status === 2 || result._status === 3) remove_attribute({id: `btn_delete`, attribute: 'disabled'});
        },
        {
            table: 'issue',
            query: [`issue_id=${path[3]}`]
        }
    );
};
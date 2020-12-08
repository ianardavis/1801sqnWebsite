showUser = (users, options) => {
    if (users.length === 1) {
        for (let [id, value] of Object.entries(users[0])) {
            try {
                let element = document.querySelector('#' + id);
                if (id === 'rank') element.innerText = value._rank 
                else if (element)  element.innerText = value;
            } catch (error) {console.log(error)};
        };
    } else alert(`${users.length} matching users found`);
};
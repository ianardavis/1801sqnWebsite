function Notification (options = {}) {
    this.e = document.createElement('li');
    this.e.classList.add('alert', 'my-1', 'p-1', 'notification');

    if      (options.urgency === 1) this.e.classList.add('alert-success')
    else if (options.urgency === 2) this.e.classList.add('alert-warning')
    else if (options.urgency === 3) this.e.classList.add('alert-danger')
    else                            this.e.classList.add('alert-info');

    this.e.setAttribute('role', 'alert', 'my-1', 'p-1', 'notification');
    let heading = document.createElement('h4'),
        date    = document.createElement('span'),
        body    = document.createElement('p');
    heading.classList.add('alert-heading');
    heading.innerText = options.title || '';
    date.classList.add('float-right', 'f-10');
    date.innerText = options.date || '';
    heading.appendChild(date);
    body.classList.add('f-09', 'm-0');
    body.innerText = options.text || '';
    this.e.appendChild(heading);
    this.e.appendChild(body);
};
function getNotifications() {
    get(
        {
            db: path[1],
            table: 'notifications'
        },
        function (notifications, options) {
            let ul_notifications = document.querySelector('#ul_notifications');
            if (ul_notifications) {
                ul_notifications.innerHTML = '';
                notifications.forEach(notification => {
                    ul_notifications.appendChild(
                        new Notification({
                            urgency: notification._urgency,
                            title:   notification._title,
                            text:    notification._notification,
                            date:    print_date(notification.createdAt, true)
                        }).e
                    );
                });
            };
        }
    );
};
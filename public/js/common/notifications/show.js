function getNotifications() {
    get({table: 'notifications'})
    .then(function ([notifications, options]) {
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
    });
};
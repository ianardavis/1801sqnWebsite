function getNotifications() {
    clear('ul_notifications')
    .then(ul_notifications => {
        get({table: 'notifications'})
        .then(function ([notifications, options]) {
            notifications.forEach(notification => {
                ul_notifications.appendChild(
                    new Notification({
                        urgency: notification.urgency,
                        title:   notification.title,
                        text:    notification.notification,
                        date:    print_date(notification.createdAt, true)
                    }).e
                );
            });
        });
    });
};
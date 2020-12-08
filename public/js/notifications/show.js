showNotifications = (notifications, options = {}) => {
    clearElement('ul_notifications');
    let div_notifications = document.querySelector('#ul_notifications');
    notifications.forEach(notification => {
        div_notifications.appendChild(
            new Notification({
                urgency: notification._urgency,
                title:   notification._title,
                text:    notification._notification,
                date:    print_date(notification.createdAt, true)
            }).e
        );
    });
    hide_spinner('notifications');
};
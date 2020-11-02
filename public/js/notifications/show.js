showNotifications = (notifications, options = {}) => {
    let div_notifications = document.querySelector('#notifications');
    div_notifications.innerHTML = '';
    notifications.forEach(notification => {
        div_notifications.appendChild(
            new Notification({
                urgency: notification._urgency,
                title:   notification._title,
                text:    notification._notification,
                date:    `${new Date(notification.createdAt).toDateString()} ${new Date(notification.createdAt).toLocaleTimeString()}`
            }).e
        );
    });
};
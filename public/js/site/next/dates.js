let today = new Date();
set_innerText("date_today", `${getDayName(today)} ${today.toLocaleDateString()}`);
let next = getNextParadeNight(today);
set_innerText("date_next",  `${getDayName(next) } ${next .toLocaleDateString()}`);

function getDayName(date) {
    return date.toLocaleDateString("EN-GB", { weekday: 'long' });
};
function getNextParadeNight(date) {
    let current = date;
    do {
        current.setDate(current.getDate() + 1);
    } while (current.getDay() !== 1 && current.getDay() !== 3);
    return current;
};
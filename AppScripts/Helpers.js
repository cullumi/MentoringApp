


// Parse Date into a format along the lines of "Jan 1, 1999, 11:59 PM".
export function parseDateText(date) {

    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0'+minutes : minutes;
    const dateText = months[date.getMonth()] +
                          " " + date.getDate() +
                          ", " + date.getFullYear() +
                          " " + hours + ":" + minutes +
                          " " + ampm;
    return dateText;
}

// Parse Date into a format along the lines of "Jan 1"
export function parseSimpleDateText(date) {
  
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dateText = months[date.getMonth()] +
                          " " + date.getDate();
    return dateText;
} 

export function capitalize(string) {
    const lower = string.toLowerCase();
    return string.charAt(0).toUpperCase() + lower.slice(1);
}

// var hours = date.getHours();
// var minutes = date.getMinutes();
// var ampm = hours >= 12 ? 'PM' : 'AM';
// hours = hours % 12;
// hours = hours ? hours : 12;
// minutes = minutes < 10 ? '0'+minutes : minutes;
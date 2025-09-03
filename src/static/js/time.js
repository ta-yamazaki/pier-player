function minSecColonFrom(timeInSec) {
    if (typeof timeInSec !== "number") return "";

    let min = Math.floor(timeInSec / 60);
    let sec = Math.floor(timeInSec % 60);
    min = ('00' + min).slice(-2);
    sec = ('00' + sec).slice(-2);
    return `${min}:${sec}`;
}
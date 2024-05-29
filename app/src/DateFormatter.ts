

export class DateFormatter {
    static agoFormat(d: number): string {
        let secondsPassed = Math.floor(((new Date()).valueOf() - d) / 1000);
        let minutesPassed = Math.floor(secondsPassed / 60);
        let hoursPassed = Math.floor(minutesPassed / 60);
        let daysPassed = Math.floor(hoursPassed / 24);
        if (minutesPassed < 1) {
            return secondsPassed === 1 ? `${secondsPassed} second ago` : `${secondsPassed} seconds ago` ;
        }
        if (hoursPassed < 1) {
            return minutesPassed === 1 ? `${minutesPassed} minute ago` : `${minutesPassed} minutes ago`;
        }
        if (daysPassed < 1) {
            return hoursPassed === 1 ? `${hoursPassed} hour ago` : `${hoursPassed} hours ago`;
        }
        return daysPassed === 1 ? `${daysPassed} day ago` : `${daysPassed} days ago`;
    }
}
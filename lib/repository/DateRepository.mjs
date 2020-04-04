import getMomentNow from '../utils/moment';
import moment from 'moment';
import momentTimezone from 'moment-timezone';

class DateRepository {
    getWeekNumber() {
        const now = getMomentNow();
        if (now.day() === 0) {
            now.subtract(1, 'days');
        }

        const then = moment('2020-03-16', 'YYYY-MM-DD').tz('Asia/Seoul');

        return now.week() - then.week() + 1;
    }
}

export default DateRepository;

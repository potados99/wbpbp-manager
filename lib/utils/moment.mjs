import moment from 'moment';
import momentTimezone from 'moment-timezone';

export default function getMomentNow() {
    return moment(new Date()).tz('Asia/Seoul');
}

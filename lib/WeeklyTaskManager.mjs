import schedule from 'node-schedule';
import config from '../config';
import getMomentNow from './utils/moment';

class WeeklyTaskManager {
    constructor({reportManager}) {
        this.reportManager = reportManager;
        this.urgingJob = null;
    }

    async scheduleNoticeOn(dow) {
        schedule.scheduleJob(`0 0 0 * * ${dow}`, async () => {
            // every ${dow} midnight
            await this._startWeeklyTask();
        });

        if (getMomentNow().day() === dow) {
            // App started in the middle the target dow
            await this._startWeeklyTask();
        }

        console.log('Task scheduled');
    }

    async _startWeeklyTask() {
        console.log('Time has come.');

        if (await this.reportManager.isDoneThisWeek()) {
            console.log('Already done. Bye.');
            return;
        }

        await this.reportManager.sayHi(config.notice_channel);

        await this._scheduleUrgeTask();
    }

    async _scheduleUrgeTask() {
        const todayAfternoon = getMomentNow()
            .set('h', config.urge_start_at)
            .set('m', 0)
            .set('s', 0)
            .subtract(1, 'm');

        const endOfToday = getMomentNow()
            .set('h', 24)
            .set('m', 0)
            .set('s', 0)
            .subtract(1, 'm');

        await this._cancelUrgingJob();

        this.urgingJob = schedule.scheduleJob({
            start: todayAfternoon.toDate(),
            end: endOfToday.toDate(),
            rule: '0 0 * * * *'
        }, async () => {
            console.log('Urge!');

            if (await this._urge()) {
                this._cancelUrgingJob();
            }
        });
    }

    async _urge() {
        if (await this.reportManager.isDoneThisWeek()) {
            return true;
        }

        await this.reportManager.urgeBadGuys(config.notice_channel);

        return false;
    }

    async _cancelUrgingJob() {
        if (this.urgingJob) {
            console.log('Stop urging');

            this.urgingJob.cancel();
            this.urgingJob = null;
        }
    }
}

export default WeeklyTaskManager;

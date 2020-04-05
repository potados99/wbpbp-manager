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
            await this._startTask();
        });

        if (getMomentNow().day() === dow) {
            // App started in the middle the target dow
            await this._startTask();
        }

        console.log('Task scheduled');
    }

    async _startTask() {
        console.log('Time has come.');

        if (await this.reportManager.isDone()) {
            console.log('Already done. Bye.');
            return ;
        }

        await this.reportManager.sayHi(config.notice_channel);

        const todayAfternoon = getMomentNow().set('h', config.urge_start_at).set('m', 0).set('s', 0).subtract(1, 'm');

        await this._cancelUrgingJob();

        this.urgingJob = schedule.scheduleJob({
            start: todayAfternoon.toDate(),
            rule: '0 0 * * * *'
        }, async () => {
            console.log('Urge!');

           if (await this._urge()) {
               this._cancelUrgingJob();
           }
        });
    }

    async _urge() {
        if (await this.reportManager.isDone()) {
            return true;
        }

        await this.reportManager.sendAllMembersStatuses(config.notice_channel);

        return false;
    }

    async _cancelUrgingJob() {
        if (this.urgingJob) {
            console.log('Stop urging');
            this.urgingJob.cancel();
        }
    }
}

export default WeeklyTaskManager;

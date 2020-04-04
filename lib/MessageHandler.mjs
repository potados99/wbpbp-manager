import config from '../config';
import webApi from './single/webApi';
import userRepo from './single/userRepo';
import reportRepo from './single/reportRepo';
import Report from './entity/Report';
import dateRepo from './single/dateRepo';

class MessageHandler {
    constructor({reportManager}) {
        this.reportManager = reportManager;
    }

    async handle(message) {
        this.ts = message.ts;
        this.text = message.text;
        this.channel = message.channel;
        this.user = await userRepo.getUserById(message.user);

        if (await this.user.isBot) {
            return;
        }

        if(await this._handleIfItIsCommand()) {
            return;
        }

        if (!await this._isValid()) {
            return;
        }

        if (!await this._isLongEnough()) {
            await this._replyInTheChannel(`${this.user.mentionString}님, 내용이 ${config.report_minimum_length}글자는 넘어야죠!`);
            await this.reportManager.sendAllMembersStatuses(this.channel);

            return;
        }

        console.log(`${this.user.displayName}(${this.user.id}) reported: ${this.text}`);

        await this._saveReport();
        await this._pinReport();

        await this._replyInTheChannel(`${this.user.mentionString}님 확인. 감사합니다.`);
        await this.reportManager.sendAllMembersStatuses(this.channel);
    }

    async _handleIfItIsCommand() {
        if (this.text.startsWith('!')) {
            await this._handleCommand();

            return true;
        } else {
            return false;
        }
    }

    async _handleCommand() {
        if (this.user.id !== 'UNEQ0CDFA') {
            console.log(`Command not allowed for ${this.user.displayName}!`);
            return;
        }

        const command = this.text.slice(1).trim();
        if (command === '요약') {
            await this.reportManager.sendWeekSummary(dateRepo.getWeekNumber(), this.channel);
        } else if (/[0-9]주차/.test(command)) {
            const weekNum = command.match(/([0-9])주차/)[1];

            await this.reportManager.sendWeekSummary(weekNum, this.channel);
        }
    }

    async _isValid() {
        for (const token of config.report_must_include) {
            if (this.text.startsWith(token)) {
                this.text = this.text.replace(token, '').trim();
                return true;
            }
        }

        return false;
    }

    async _isLongEnough() {
        return this.text.length > config.report_minimum_length ;
    }

    async _saveReport() {
        const report = new Report({
            userId: this.user.id,
            weekNum: dateRepo.getWeekNumber(),
            content: this.text,
        });

        await reportRepo.saveReport(report);
    }

    async _pinReport() {
        try {
            await webApi.pins.add({
                channel: this.channel,
                timestamp: this.ts,
            });
        } catch (e) {
            console.error(e);
        }
    }

    async _replyInTheChannel(text) {
        try {
            await webApi.chat.postMessage({
                channel: this.channel,
                text: text,
            });
        } catch (e) {
            console.error(e);
        }
    }
}

export default MessageHandler;

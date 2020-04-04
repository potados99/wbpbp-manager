import webApi from './single/webApi';
import userRepo from './single/userRepo';
import reportRepo from './single/reportRepo';
import dateRepo from './single/dateRepo';

class ReportManager {
    async sayHi(channel) {
        await webApi.chat.postMessage({
            channel: channel,
            text: '안녕하세요 매니저입니다.\n진행상황 업로드 바랍니다.\n올리실 때에 \'[진행상황]\' 키워드 꼭 포함해주세요.',
        });
    }

    async sendAllMembersStatuses(channel) {
        let text = '';

        const goodGuys = await this._getGoodGuys(dateRepo.getWeekNumber());
        const badGuys = await this._getBadGuys(dateRepo.getWeekNumber());

        if (goodGuys.length > 0) {
            text += `*${dateRepo.getWeekNumber()}주차 진행상황*\n`;
            for (const user of goodGuys) {
                const report = await reportRepo.getReportOfUserOfWeek(user.id, dateRepo.getWeekNumber());
                text += `${user.mentionString}님:\n> ${report.content}\n`
            }
        }

        if (badGuys.length > 0) {
            text += '*진행상황 업로드 요청*\n';
            text += badGuys.map((user) => `${user.mentionString}님`).join(', ');
            text += ' 진행상황 업로드 바랍니다.'
        }

        await this._sendInChannel(text, channel);
    }

    async _getGoodGuys(weekNum) {
        const users = await userRepo.getRealUsers();
        const reportsThisWeek = await reportRepo.getReportsOfWeek(weekNum);

        return users.filter((user) => !!reportsThisWeek.find((report) => report.userId === user.id));
    }

    async _getBadGuys(weekNum) {
        const users = await userRepo.getRealUsers();
        const reportsThisWeek = await reportRepo.getReportsOfWeek(weekNum);

        return users.filter((user) => !reportsThisWeek.find((report) => report.userId === user.id));
    }

    async sendWeekSummary(weekNum, channel) {
        let text = `*${weekNum}주차 진행상황 요약*\n`;

        const goodGuys = await this._getGoodGuys(weekNum);
        const badGuys = await this._getBadGuys(weekNum);

        if (goodGuys.length === 0) {
            text += '없음\n';
        } else {

            for (const user of goodGuys) {
                const report = await reportRepo.getReportOfUserOfWeek(user.id, dateRepo.getWeekNumber());
                text += `${user.displayName}님: ${report.content}\n`
            }

            for (const user of badGuys) {
                text += `${user.displayName}님: -\n`
            }
        }

        await this._sendInChannel(text, channel);
    }

    async _sendInChannel(text, channel) {
        try {
            await webApi.chat.postMessage({
                channel: channel,
                text: text,
            });
        } catch (e) {
            console.error(e);
        }
    }

    async isDone() {
        const users = await userRepo.getRealUsers();
        const userIds = users.map((user) => user.id);

        for (const userId of userIds) {
            const report = await reportRepo.getReportOfUserOfWeek(userId, dateRepo.getWeekNumber());
            if (!report) {
                return false;
            }
        }

        return true;
    }
}

export default ReportManager;

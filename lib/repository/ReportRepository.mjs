import userRepo from '../single/userRepo';
import redis from 'async-redis';
import Report from '../entity/Report';

class ReportRepository {
    constructor() {
        this.client = redis.createClient(process.env.REDIS_URL);

        this.client.on('connect', () => {
            console.log('Redis connected');
        });
    }

    async saveReport(report) {
        await this.client.sadd(report.weekNum, JSON.stringify(report));
    }

    async getReportOfUserOfWeek(userId, weekNum) {
        const reportsThisWeek = await this.getReportsOfWeek(weekNum);

        const reportsOfUserThisWeek = reportsThisWeek.filter((report) => report.userId === userId);
        if (reportsOfUserThisWeek.length === 0) {
            return null;
        }

        return new Report({
            userId: userId,
            weekNum: weekNum,
            content: reportsOfUserThisWeek.map((report) => report.content).join(' / '),
        });
    }

    async getReportsOfWeek(weekNum) {
        return (await this.client.smembers(weekNum) || []).map((reportJSON) => JSON.parse(reportJSON));
    }
}

export default ReportRepository;

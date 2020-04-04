import slackEvents from './lib/single/slackEvents';
import MessageHandler from './lib/MessageHandler';
import ReportManager from './lib/ReportManager';
import WeeklyTaskManager from './lib/WeeklyTaskManager';
import config from './config';

async function start() {
    const port = process.env.PORT || 3000;
    const reportManager = new ReportManager();

    const taskManager = new WeeklyTaskManager({
        reportManager: reportManager,
    });

    await taskManager.scheduleNoticeOn(config.report_dow);

    const handler = new MessageHandler({
        reportManager: reportManager,
    });

    slackEvents.on('message', async (messageEvent) => {
        await handler.handle(messageEvent);
    });

    await slackEvents.start(port);
}

start();

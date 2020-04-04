import event from '@slack/events-api';

const slackSigningSecret = process.env.SLACK_SIGNING_SECRET || 'secret';
const slackEvents = event.createEventAdapter(slackSigningSecret);

export default slackEvents;

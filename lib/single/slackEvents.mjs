import event from '@slack/events-api';
import config from '../../config';

const slackEvents = event.createEventAdapter(config.slack_signing_secret);

export default slackEvents;

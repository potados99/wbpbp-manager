import api from '@slack/web-api';

const slackToken = process.env.SLACK_TOKEN || 'xoxb-blahblah';
const webApi = new api.WebClient(slackToken);

export default webApi;

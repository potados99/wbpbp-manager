import api from '@slack/web-api';
import config from '../../config';

const webApi = new api.WebClient(config.slack_token);

export default webApi;

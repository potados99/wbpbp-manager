if (!process.env.REDIS_URL) {
    throw new Error('No REDIS_URL');
}
if (!process.env.SLACK_TOKEN) {
    throw new Error('No SLACK_TOKEN');
}
if (!process.env.NOTICE_CHANNEL) {
    throw new Error('No NOTICE_CHANNEL');
}
if (!process.env.SLACK_SIGNING_SECRET) {
    throw new Error('No SLACK_SIGNING_SECRET');
}

export default {
    report_must_include: [
        '[진행상황]',
        '[진행 상황]',
    ],
    report_dow: 0, /* 0 or 7. sunday */
    urge_start_at: 15, /* 3pm */
    report_minimum_length: 10,
};


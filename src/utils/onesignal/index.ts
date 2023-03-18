import * as OneSignal from 'onesignal-node';

const oneSignalClient = new OneSignal.Client(
  process.env.ONE_SIGNAL_APP_ID,
  process.env.ONE_SIGNAL_REST_API_KEY,
);

export default oneSignalClient;

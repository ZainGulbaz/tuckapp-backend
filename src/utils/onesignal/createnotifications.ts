const createNotification = (
  title: string,
  content: { en: string },
  includedPlayerIds: string[],
) => {
  return {
    app_id: process.env.ONE_SIGNAL_APP_ID,
    title,
    contents: {
      en: content.en,
    },
    include_player_ids: includedPlayerIds,
  };
};

export default createNotification;

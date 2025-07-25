class Listener {
  constructor(playlistsService, mailSender) {
    this._playlistsService = playlistsService;
    this._mailSender = mailSender;

    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());

      const playlist = await this._playlistsService.getPlaylistForExport(playlistId);
      const result = await this._mailSender.sendEmail(targetEmail, playlist);
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Listener;

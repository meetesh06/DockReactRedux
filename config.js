const config = {
  port: process.env.PORT || 65534,
  host: process.env.HOST || '127.0.0.1',
  getHost() {
    return 'http://'+this.host+':'+this.port;
  }
};
module.exports = config;
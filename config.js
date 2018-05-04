const config = {
  port: process.env.PORT || 7190,
  host: process.env.HOST || '0.0.0.0',
  getHost() {
    return 'http://'+this.host+':'+this.port;
  }
};
export default config;
export type Config = {
  name: string,
  env: string,
  envFilePath: string,
  logLevel: 'emerg' | 'alert' | 'crit' | 'error' | 'warning' | 'notice' | 'info' | 'debug',
  enableLogs: boolean,
  server: {
    host: string,
    port: number,
    protocol: 'http' | 'https' | 'socket',
  },
  public_server: {
    host: string,
    port: number,
    protocol: 'http' | 'https',
  }
  db: {
    client: 'sqlite' | 'postgresql' | 'mysql',
    connection: {
      filename: string,
      host: string,
      database: string,
      user: string,
      password: string,
      port: number,
    },
    pool: {
      min: number,
      max: number,
    },
  },
  oauth2: {
    expiry: {
      accessToken: number,
      refreshToken: number,
      code: number,
    },
  },
};

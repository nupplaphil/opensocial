import convict from 'convict';
import {existsSync} from 'fs';
import {Config} from './types';

const config = convict<Config>({
  name: {
    doc: 'Name of the Node',
    format: String,
    default: 'OpenSocial',
    env: 'NODE_NAME',
  },
  env: {
    doc: 'Environment',
    format: String,
    default: 'development',
    env: 'NODE_ENV',
  },
  envFilePath: {
    doc: 'Path to .env file',
    format: String,
    default: 'env.json',
    env: 'ENV_FILE_PATH',
  },
  logLevel: {
    doc: 'Winston log level',
    format: ['emerg', 'alert', 'crit', 'error', 'warning', 'notice', 'info', 'debug'],
    default: 'info',
    env: 'LOG_LEVEL',
  },
  enableLogs: {
    doc: 'Flag to turn on logging',
    format: Boolean,
    default: true,
    env: 'ENABLE_LOGS',
  },
  server: {
    host: {
      doc: 'Hostname or IP address the server will listen on',
      format: String,
      default: '0.0.0.0',
      env: 'HOST',
    },
    port: {
      doc: 'Port the server will listen on',
      format: 'port',
      default: 8001,
      env: 'PORT',
    },
    protocol: {
      doc: 'Protocol used',
      format: ['http', 'https', 'socket'],
      default: 'http',
      env: 'PROTOCOL',
    },
  },
  public_server: {
    host: {
      doc: 'Hostname or IP address of the public/web server',
      format: String,
      default: '0.0.0.0',
      env: 'PUBLIC_HOST',
    },
    port: {
      doc: 'Port the public/web server will listen on',
      format: 'port',
      default: 8080,
      env: 'PUBLIC_PORT',
    },
    protocol: {
      doc: 'Protocol used for the public/web server',
      format: ['http', 'https'],
      default: 'http',
      env: 'PUBLIC_PROTOCOL',
    },
  },
  db: {
    client: {
      doc: 'Database client',
      format: ['sqlite', 'postgresql', 'mysql'],
      default: 'sqlite',
      env: 'DATABASE_CLIENT',
    },
    connection: {
      filename: {
        doc: 'Filename of the SQLite file',
        format: String,
        default: 'dev.sqlite3',
        env: 'DATABASE_SQLITE',
      },
      host: {
        doc: 'Database host',
        format: String,
        default: 'localhost',
        env: 'DATABASE_HOSTNAME',
      },
      database: {
        doc: 'Database name',
        format: String,
        default: 'opensocial',
        env: 'DATABASE_NAME',
      },
      user: {
        doc: 'Database username',
        format: String,
        default: 'opensocial',
        env: 'DATABASE_USERNAME',
      },
      password: {
        doc: 'Database password',
        format: String,
        default: 'opensocial',
        env: 'DATABASE_PASSWORD',
      },
      port: {
        doc: 'Database port',
        format: Number,
        default: 5432,
        env: 'DATABASE_PORT',
      },
    },
    pool: {
      min: {
        doc: 'Database minimum connections',
        format: Number,
        default: 0,
        env: 'DATABASE_POOL_MIN',
      },
      max: {
        doc: 'Database maximum connections',
        format: Number,
        default: 19,
        env: 'DATABASE_POOL_MAX',
      },
    }
  },
  oauth2: {
    expiry: {
      accessToken: {
        doc: 'Duration until a access token is expired',
        format: Number,
        default: 600,
        env: "OAUTH2_EXPIRE_ACCESS_TOKEN",
      },
      refreshToken: {
        doc: 'Duration until a refresh token is expired',
        format: Number,
        default: 3600 * 6,
        env: "OAUTH2_EXPIRE_REFRESH_TOKEN",
      },
      code: {
        doc: 'Duration until the token code is expired',
        format: Number,
        default: 600,
        env: "OAUTH2_EXPIRE_CODE",
      }
    }
  }
});

if (config.get('env') === 'development' && existsSync(config.get('envFilePath'))) {
  config.loadFile(config.get('envFilePath'));
}

config.validate({ allowed: 'strict' });

export default config;

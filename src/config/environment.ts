import convict from 'convict';
import { existsSync } from 'fs';

const config: convict.Config<{
  env: string,
  envFilePath: string,
  name: string,
  logLevel: string,
  enableLogs: true,
  host: string,
  port: number,
  protocol: string
}> = convict({
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
  name: {
    doc: 'Name of application',
    format: String,
    default: 'opensocial',
    env: 'APP_NAME',
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
  host: {
    doc: 'Hostname or IP address the server will listen on',
    format: String,
    default: '0.0.0.0',
    env: 'HOST',
  },
  port: {
    doc: 'Port the server will listen on',
    format: 'port',
    default: 8000,
    env: 'PORT',
  },
  protocol: {
    doc: 'Protocol used',
    format: ['http', 'https', 'socket'],
    default: 'http',
    env: 'PROTOCOL',
  },
});

if (config.get('env') === 'development' && existsSync(config.get('envFilePath'))) {
  config.loadFile(config.get('envFilePath'));
}

config.validate({ allowed: 'strict' });

export default config;

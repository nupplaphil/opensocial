import { ServerRegisterPluginObject } from '@hapi/hapi';
import config from '@config/environment';
import * as HapiSwagger from 'hapi-swagger';
import * as Inert from '@hapi/inert';
import * as Vision from '@hapi/vision';

const swaggerOptions: HapiSwagger.RegisterOptions = {
  info: {
    title: 'API Documentation',
    description: 'Description goes here',
    version: '1.0.0',
  },
  schemes: [config.get('protocol')],
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const plugins: Array<ServerRegisterPluginObject<any>> = [
  {
    plugin: Vision,
  },
  {
    plugin: Inert,
  },
  {
    plugin: HapiSwagger,
    options: swaggerOptions,
  },
];

export default plugins;

import MyWebSocket from './src/websocket';
import { addAliases } from 'module-alias';

addAliases({
  '@src': `${__dirname}/src`,
  '@root': `${__dirname}`,
});

new MyWebSocket();

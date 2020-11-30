import { remote } from 'electron';
import axios from 'axios';
import Settings from './settings';

const settings = new Settings(remote.app);

export default axios.create({
  baseURL: 'https://www.udemy.com/api-2.0/',
  timeout: 30000,
  headers: {
    Authorization: `Bearer ${settings.get('auth.token')}`,
  },
});

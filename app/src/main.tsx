import { render } from 'preact';
import { initTelegram } from './tg/telegram';
import { App } from './App';
import './styles/base.css';

initTelegram();
render(<App />, document.getElementById('app')!);

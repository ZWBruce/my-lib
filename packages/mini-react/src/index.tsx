import { render } from '@source/react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { run } from '@source/fiber';
run();
render(<App />, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

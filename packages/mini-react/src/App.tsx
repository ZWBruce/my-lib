import './App.css';
import Cmp1 from '@src/components/Cmp1';

function App() {
  const handleClick = () => {
    console.log('click');
  };
  return (
    <div className="app-container">
      <header onClick={handleClick} style={{ color: 'red' }}>
        hello mini-react
      </header>
      <Cmp1 />
    </div>
  );
}

export default App;

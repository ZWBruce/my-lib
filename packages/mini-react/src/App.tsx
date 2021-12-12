import './App.css';

function App() {
  const handleClick = () => {
    console.log('click');
  };
  return (
    <div className="app-container">
      <header onClick={handleClick} style={{ color: 'red' }}>
        hello mini-react
      </header>
    </div>
  );
}

export default App;

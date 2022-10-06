import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Hi there</h1>
      </header>
      <svg width="100%" height="400px">

        <circle r="25%" cx="50%" cy="50%" fill="yellow" stroke="black" stroke-width="5">
          <circle r="50"/>
        </circle>

      </svg>
    </div>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import './App.css';
import logo from './logo.svg';

function App() {
  const [text, setText] = useState(''); // State to hold the fetched text
  const [loading, setLoading] = useState(true); // State to track loading status
  const [error, setError] = useState(null); // State to track errors

  useEffect(() => {
    // Define the fetch call inside useEffect
    const fetchText = async () => {
      try {
        const response = await fetch('http://lift-and-shift-env.eba-kekvarn7.us-east-2.elasticbeanstalk.com/hello');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.text(); // Assuming the response is plain text
        setText(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchText();
  }, []); // Empty dependency array means this effect runs once on component mount


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <p>
          {loading ? 'loading' : (error ? 'error' : text)}
        </p>
      </header>
    </div>
  );
}

export default App;

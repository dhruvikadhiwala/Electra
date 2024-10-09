import React, { useState, useEffect } from 'react';
import './App.css';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { Tooltip } from 'react-tooltip';

// A function to generate different shades of navy blue-teal based on a seed value (could be state index)
const generateShade = (index) => {
  const baseColor = 180; // Base hue for teal
  const shade = baseColor + (index % 10) * 6; // Generate a unique shade within navy blue-teal range
  return `hsl(${shade}, 40%, 50%)`; // Use HSL to define the color
};

// Function to render a table with a given title and data
const renderTable = (title, data) => {
  console.log(data)
  if (!data || data.length === 0) return null; // Return null if there's no data

  return (
    <div className="results-container">
      <h2>{title}</h2>
      <table>
        <thead>
          <tr>
            {/* Render table headers dynamically based on data keys */}
            {Object.keys(data[0]).map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Render table rows dynamically based on data values */}
          {data.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((value, i) => (
                <td key={i}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function App() {
  const [stateName, setStateName] = useState(''); // State for selected state name
  const [scenario, setScenario] = useState(''); // State for user scenario
  const [response, setResponse] = useState(null); // State for API response
  const [loading, setLoading] = useState(false); // State for loading indicator

  // Function to handle form submission and fetch API data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      // API call with POST method
      const apiResponse = await fetch('https://penn-apps-api.proudground-9bf18e76.westus.azurecontainerapps.io/gen_sim_network', {
        method: 'POST',
        body: new URLSearchParams({
          'state_name': stateName, // Pass the state name
          'user_scenario': scenario // Pass the scenario
        }),
        
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded' // Set the Content-Type header
        }
      });

      if (!apiResponse.ok) {
        throw new Error(`HTTP error! Status: ${apiResponse.status}`);
      }

      const data = await apiResponse.json(); // Parse JSON response
      console.log("API Response:", data); // Log the response
      setResponse(data); // Set the entire response in state
    } catch (error) {
      console.error('Error:', error); // Log error to console
      alert(`An error occurred: ${error.message}`); // Alert user of error
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  // Function to handle state click and set state name
  const handleStateClick = async (geo) => {
    setStateName(geo.properties.name); // Set the state name in the input field
    const apiResponse = await fetch('https://penn-apps-api.proudground-9bf18e76.westus.azurecontainerapps.io/get_state_data', {
        method: 'POST',
        body: new URLSearchParams({
            'state_name': geo.properties.name, // Pass the state name
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded' // Set the Content-Type header
        }
    }
    ); // Close the fetch function here
};


  // Function to reset the form and map selection
  const handleReset = () => {
    setStateName('');
    setScenario('');
    setResponse(null);
  };

  // UseEffect to log response on change
  useEffect(() => {
    console.log('Updated response:', response);
  }, [response]);

  return (
    <div className="App">
      <div className="title-container">
        <h1>Electra <span role="img" aria-label="feather">🪶</span></h1> {/* Added feather emoji */}
      </div>

      {/* Container to position form and chat on the left, map on the right */}
      <div className="main-container">
        {/* Container for form and chat */}
        <div className="form-chat-container">
          {/* Form Container */}
          <div className="form-container">
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="stateName">State Name:</label>
                <input
                  type="text"
                  id="stateName"
                  value={stateName} // Bind state name to input field
                  onChange={(e) => setStateName(e.target.value)} // Update state name
                  placeholder="Enter the state name"
                  required
                />
              </div>
              <div>
                <label htmlFor="scenario">Scenario:</label>
                <input
                  type="text"
                  id="scenario"
                  value={scenario} // Bind scenario to input field
                  onChange={(e) => setScenario(e.target.value)} // Update scenario
                  placeholder="Enter the scenario"
                  required
                />
              </div>
              <button type="submit">Run Simulation</button>
              <button type="button" onClick={handleReset}>Reset</button> {/* Reset Button */}
            </form>
          </div>

          {/* Chat Box if Available */}
          {response && response.chat && response.chat.length > 0 && (
            <div className="chat-container">
              <h2>Agent Conversations</h2>
              <div className="chat-box">
                {response.chat.map((chatMessage, index) => (
                  <div key={index} className="chat-message">
                    <div className="agent-info">
                      <p>{chatMessage.identity.split(':')[0]} (Age: {chatMessage.identity.match(/Age: (\d+-\d+|\d+)/)[1]})</p>
                    </div>
                    <div className="agent-message">
                      <p>{chatMessage.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map Component with Clickable States */}
        <div className="map-container">
          <ComposableMap projection="geoAlbersUsa">
            <Geographies geography="https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json">
              {({ geographies }) =>
                geographies.map((geo, index) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleStateClick(geo)} // Handle state click
                    data-tooltip-id="tooltip"
                    data-tooltip-content={geo.properties.name}
                    style={{
                      default: {
                        fill: generateShade(index), // Different shade for each state within navy blue-teal range
                        stroke: "#ffffff", // White border for each state
                        strokeWidth: 0.75, // Border width
                        outline: "none"
                      },
                      hover: { fill: "#1abc9c" }, // Updated hover color
                      pressed: { fill: "#16a085" } // Updated pressed color
                    }}
                  />
                ))
              }
            </Geographies>
          </ComposableMap>
          <Tooltip id="tooltip" />
        </div>
      </div>

      {/* Display Pre-Scenario Voting Demographics Table */}
      {response && response.preScenario && response.preScenario.length > 0 &&
        renderTable('Pre-Scenario Voting Demographics', response.preScenario)}

      {/* Display Post-Scenario Voting Demographics Table */}
      {response && response.postScenario && response.postScenario.length > 0 &&
        renderTable('Post-Scenario Voting Demographics', response.postScenario)}

      {/* Display Loading Message */}
      {loading && <p>Loading...</p>}
    </div>
  );
}

export default App;

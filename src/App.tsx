import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface Player {
  id: number;
  name: string;
  health: number;
  strength: number;
  attack: number;
}

const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState('');
  const [health, setHealth] = useState(100);
  const [strength, setStrength] = useState(10);
  const [attack, setAttack] = useState(15);
  const [idFirst, setIdFirst] = useState(0);
  const [idSecond, setIdSecond] = useState(1);
  const [battleResult, setBattleResult] = useState<{ winner: number, loser: number, battleLogs: string[] } | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    const response = await axios.get<Player[]>('http://localhost:3000/displayPlayers');
    setPlayers(response.data);
  };

  const addPlayer = async () => {
    if(name=="") {
      window.alert("Please enter name of the player.");
      return;
    } else if(health<=0) {
      window.alert("Health should be a positive integer.")
      return;
    } else if(strength<=0) {
      window.alert("Strength should be a positive integer.");
      return;
    } else if(attack<=0) {
      window.alert("Attack should be a positive integer.");
      return;
    }
    await axios.post('http://localhost:3000/addPlayer', { name, health, strength, attack });
    fetchPlayers();
  };

  const startBattle = async () => {
    if(idFirst<0) {
      window.alert("First ID should be a non-negative integer.");
      return;
    } else if(idSecond<0) {
      window.alert("Second ID should be a non-negative integer.");
      return;
    }

    const playerIds = players.map(player => player.id);
    if (!playerIds.includes(idFirst)) {
      window.alert(`Player with ID ${idFirst} does not exist.`);
      return;
    } else if (!playerIds.includes(idSecond)) {
      window.alert(`Player with ID ${idSecond} does not exist.`);
      return;
    }

    if(idFirst==idSecond) {
      window.alert("IDs cannot be the same for both players.");
      return
    }
    
    const response = await axios.post('http://localhost:3000/battle', { id_first: idFirst, id_second: idSecond });
    setBattleResult(response.data);
    fetchPlayers();
  };

  return (
    <div className="App">
      <h1>Magical Arena</h1>

      <div className="add-player-form">
        <h2>Add New Player</h2>
        <label>
          Name: <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        </label>
        <label>
          Health: <input type="number" placeholder="Health" value={health} onChange={e => setHealth(Number(e.target.value))} />
        </label>
        <label>
          Strength: <input type="number" placeholder="Strength" value={strength} onChange={e => setStrength(Number(e.target.value))} />
        </label>
        <label>
          Attack: <input type="number" placeholder="Attack" value={attack} onChange={e => setAttack(Number(e.target.value))} />
        </label>
        <button onClick={addPlayer}>Add Player</button>
      </div>

      <div className="players-list">
        <h2>Current Players in the Arena:</h2>
        <div>
          {players.length ? players.map(player => (
            <div key={player.id} className="player">
              <p>ID: {player.id}</p>
              <p>Name: {player.name}</p>
              <p>Health: {player.health}</p>
              <p>Strength: {player.strength}</p>
              <p>Attack: {player.attack}</p>
            </div>
          )): "Arena is empty! Add some players to get going."}
        </div>
      </div>

      <div className="battle-form">
        <h2>Start a new Battle {battleResult && "(Scroll below for results!)"}</h2>
        <label>
          First Player ID: <input type="number" placeholder="First Player ID" value={idFirst} onChange={e => setIdFirst(Number(e.target.value))} />
        </label>
        <label>
          Second Player ID: <input type="number" placeholder="Second Player ID" value={idSecond} onChange={e => setIdSecond(Number(e.target.value))} />
        </label>
        <button onClick={startBattle}>Start Battle</button>
      </div>

      {battleResult && (
        <div className="battle-result">
          <h2>Battle Result</h2>
          <p>Winner ID: {battleResult.winner}</p>
          <p>Loser ID: {battleResult.loser} (Removed from the Arena)</p>
          <br />
          <h3>Battle Logs below:</h3>
          <div>
            {battleResult.battleLogs.map((log, index) => (
              <p key={index}>{log}</p>
            ))}
          </div>
          
        </div>
      )}
    </div>
  );
}

export default App;
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
  const [health, setHealth] = useState(0);
  const [strength, setStrength] = useState(0);
  const [attack, setAttack] = useState(0);
  const [idFirst, setIdFirst] = useState(0);
  const [idSecond, setIdSecond] = useState(0);
  const [battleResult, setBattleResult] = useState<{ winner: number, loser: number } | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    const response = await axios.get<Player[]>('http://localhost:3000/displayPlayers');
    setPlayers(response.data);
  };

  const addPlayer = async () => {
    await axios.post('http://localhost:3000/addPlayer', { name, health, strength, attack });
    fetchPlayers();
  };

  const startBattle = async () => {
    const response = await axios.post('http://localhost:3000/battle', { id_first: idFirst, id_second: idSecond });
    setBattleResult(response.data);
    fetchPlayers();
  };

  return (
    <div className="App">
      <h1>Magical Arena</h1>

      <div className="add-player-form">
        <h2>Add New Player</h2>
        <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input type="number" placeholder="Health" value={health} onChange={e => setHealth(Number(e.target.value))} />
        <input type="number" placeholder="Strength" value={strength} onChange={e => setStrength(Number(e.target.value))} />
        <input type="number" placeholder="Attack" value={attack} onChange={e => setAttack(Number(e.target.value))} />
        <button onClick={addPlayer}>Add Player</button>
      </div>

      <div className="players-list">
        <h2>Players</h2>
        <div>
          {players.map(player => (
            <div key={player.id} className="player">
              <p>ID: {player.id}</p>
              <p>Name: {player.name}</p>
              <p>Health: {player.health}</p>
              <p>Strength: {player.strength}</p>
              <p>Attack: {player.attack}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="battle-form">
        <h2>Battle</h2>
        <input type="number" placeholder="First Player ID" value={idFirst} onChange={e => setIdFirst(Number(e.target.value))} />
        <input type="number" placeholder="Second Player ID" value={idSecond} onChange={e => setIdSecond(Number(e.target.value))} />
        <button onClick={startBattle}>Start Battle</button>
      </div>

      {battleResult && (
        <div className="battle-result">
          <h2>Battle Result</h2>
          <p>Winner ID: {battleResult.winner}</p>
          <p>Loser ID: {battleResult.loser}</p>
        </div>
      )}
    </div>
  );
}

export default App;

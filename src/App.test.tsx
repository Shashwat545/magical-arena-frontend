import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import App from './App';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('App Component', () => {
  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the app and checks for static text', () => {
    render(<App />);
    expect(screen.getByText('Magical Arena')).toBeInTheDocument();
    expect(screen.getByText('Add New Player')).toBeInTheDocument();
    expect(screen.getByText('Current Players in the Arena:')).toBeInTheDocument();
    expect(screen.getByText('Start a new Battle')).toBeInTheDocument();
  });

  it('displays a message when there are no players', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Arena is empty! Add some players to get going.')).toBeInTheDocument();
    });
  });

  it('adds a new player', async () => {
    mockedAxios.post.mockResolvedValue({});
    mockedAxios.get.mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({
      data: [
        {
          id: 0,
          name: 'Warrior',
          health: 100,
          strength: 10,
          attack: 15,
        },
      ],
    });

    render(<App />);
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Warrior' } });
    fireEvent.change(screen.getByPlaceholderText('Health'), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText('Strength'), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText('Attack'), { target: { value: '15' } });

    fireEvent.click(screen.getByText('Add Player'));

    await waitFor(() => {
      expect(screen.getByText('ID: 0')).toBeInTheDocument();
      expect(screen.getByText('Name: Warrior')).toBeInTheDocument();
      expect(screen.getByText('Health: 100')).toBeInTheDocument();
      expect(screen.getByText('Strength: 10')).toBeInTheDocument();
      expect(screen.getByText('Attack: 15')).toBeInTheDocument();
    });
  });

  it('does not add a player with invalid attributes', async () => {
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: '' } });
    fireEvent.click(screen.getByText('Add Player'));
    expect(window.alert).toHaveBeenCalledWith('Please enter name of the player.');

    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Warrior' } });
    fireEvent.change(screen.getByPlaceholderText('Health'), { target: { value: '-100' } });
    fireEvent.click(screen.getByText('Add Player'));
    expect(window.alert).toHaveBeenCalledWith('Health should be a positive integer.');

    fireEvent.change(screen.getByPlaceholderText('Health'), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText('Strength'), { target: { value: '-10' } });
    fireEvent.click(screen.getByText('Add Player'));
    expect(window.alert).toHaveBeenCalledWith('Strength should be a positive integer.');

    fireEvent.change(screen.getByPlaceholderText('Strength'), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText('Attack'), { target: { value: '-15' } });
    fireEvent.click(screen.getByText('Add Player'));
    expect(window.alert).toHaveBeenCalledWith('Attack should be a positive integer.');
  });

  it('starts a battle between two players', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        winner: 0,
        loser: 1,
        battleLogs: [
          'Warrior hits Mage with power = 45',
          'Mage defends with power = 20',
          "Mage's health: 55",
          'Mage hits Warrior with power = 30',
          'Warrior defends with power = 35',
          "Warrior's health: 100",
          'Warrior hits Mage with power = 60',
          'Mage defends with power = 25',
          "Mage's health: 20",
          'Warrior hits Mage with power = 90',
          'Mage defends with power = 30',
          "Mage's health: 0",
          'Warrior has won!',
        ],
      },
    });

    mockedAxios.get.mockResolvedValue({
      data: [
        {
          id: 0,
          name: 'Warrior',
          health: 100,
          strength: 10,
          attack: 15,
        },
        {
          id: 1,
          name: 'Mage',
          health: 80,
          strength: 8,
          attack: 12,
        },
      ],
    });

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('ID: 0')).toBeInTheDocument();
      expect(screen.getByText('ID: 1')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('First Player ID'), { target: { value: '0' } });
    fireEvent.change(screen.getByPlaceholderText('Second Player ID'), { target: { value: '1' } });

    fireEvent.click(screen.getByText('Start Battle'));

    await waitFor(() => {
      expect(screen.getByText('Battle Result')).toBeInTheDocument();
      expect(screen.getByText('Winner ID: 0')).toBeInTheDocument();
      expect(screen.getByText('Loser ID: 1 (Removed from the Arena)')).toBeInTheDocument();
      expect(screen.getByText('Warrior hits Mage with power = 45')).toBeInTheDocument();
    });
  });

  it('does not start a battle with invalid player IDs', async () => {
    mockedAxios.get.mockResolvedValue({
      data: [
        {
          id: 0,
          name: 'Warrior',
          health: 100,
          strength: 10,
          attack: 15,
        },
      ],
    });

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('ID: 0')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('First Player ID'), { target: { value: '0' } });
    fireEvent.change(screen.getByPlaceholderText('Second Player ID'), { target: { value: '0' } });
    fireEvent.click(screen.getByText('Start Battle'));
    expect(window.alert).toHaveBeenCalledWith('IDs cannot be the same for both players.');

    fireEvent.change(screen.getByPlaceholderText('Second Player ID'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Start Battle'));
    expect(window.alert).toHaveBeenCalledWith('Player with ID 1 does not exist.');
  });
});

import './styles/main.css';
import './styles/pokedex.css';
import './styles/type-selector.css';
import './styles/random-pokemon.css';
import './styles/hologram.css';
import { createPokedex } from './components/Pokedex.js';

// Main entry point
const app = document.querySelector('#app');
app.innerHTML = '';
app.appendChild(createPokedex());

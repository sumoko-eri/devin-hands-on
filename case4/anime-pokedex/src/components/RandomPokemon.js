/**
 * RandomPokemon component - Fetches and displays a random Pokemon from a selected type
 */

import { animate } from 'animejs';

const POKEAPI_TYPE_URL = 'https://pokeapi.co/api/v2/type/';
const POKEAPI_POKEMON_URL = 'https://pokeapi.co/api/v2/pokemon/';

/**
 * Fetches Pokemon list for a given type
 * @param {string} typeName - The type name
 * @returns {Promise<Array>} Array of Pokemon in this type
 */
async function fetchPokemonByType(typeName) {
  const response = await fetch(`${POKEAPI_TYPE_URL}${typeName}`);
  if (!response.ok) {
    throw new Error('Failed to fetch Pokemon by type');
  }
  const data = await response.json();
  return data.pokemon.map(p => p.pokemon);
}

/**
 * Fetches detailed Pokemon data
 * @param {string} pokemonUrl - The Pokemon API URL
 * @returns {Promise<Object>} Pokemon details
 */
async function fetchPokemonDetails(pokemonUrl) {
  const response = await fetch(pokemonUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch Pokemon details');
  }
  return response.json();
}

/**
 * Gets a random Pokemon from a type and returns its details
 * @param {string} typeName - The type name
 * @returns {Promise<Object>} Random Pokemon details
 */
export async function getRandomPokemon(typeName) {
  const pokemonList = await fetchPokemonByType(typeName);
  const randomIndex = Math.floor(Math.random() * pokemonList.length);
  const randomPokemon = pokemonList[randomIndex];
  const details = await fetchPokemonDetails(randomPokemon.url);
  
  return {
    id: details.id,
    name: details.name,
    image: details.sprites.other['official-artwork'].front_default,
  };
}

/**
 * Creates the RandomPokemon display component
 * @returns {HTMLElement} The Pokemon display element
 */
export function createRandomPokemonDisplay() {
  const container = document.createElement('div');
  container.className = 'random-pokemon-container';
  container.innerHTML = `
    <div class="pokemon-image-wrapper">
      <img class="pokemon-image" src="" alt="" />
    </div>
    <div class="pokemon-info">
      <span class="pokemon-number"></span>
      <span class="pokemon-name"></span>
    </div>
  `;
  return container;
}

/**
 * Displays a Pokemon with animation
 * @param {HTMLElement} container - The container element
 * @param {Object} pokemon - Pokemon data (id, name, image)
 */
export function displayPokemon(container, pokemon) {
  const imageWrapper = container.querySelector('.pokemon-image-wrapper');
  const image = container.querySelector('.pokemon-image');
  const numberEl = container.querySelector('.pokemon-number');
  const nameEl = container.querySelector('.pokemon-name');

  // Set Pokemon data
  image.src = pokemon.image;
  image.alt = pokemon.name;
  numberEl.textContent = `No.${String(pokemon.id).padStart(4, '0')}`;
  nameEl.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

  // Reset for animation
  container.style.opacity = '0';
  container.style.transform = 'translateY(100px)';
  
  // Animate appearance - slide up with glow effect
  animate(container, {
    opacity: [0, 1],
    translateY: [100, 0],
    duration: 800,
    ease: 'outExpo',
  });

  // Add glow animation to image
  animate(imageWrapper, {
    boxShadow: [
      '0 0 0px rgba(255, 255, 255, 0)',
      '0 0 30px rgba(255, 255, 255, 0.8)',
      '0 0 60px rgba(100, 200, 255, 0.6)',
      '0 0 30px rgba(255, 255, 255, 0.4)',
    ],
    duration: 1200,
    ease: 'inOutQuad',
  });
}

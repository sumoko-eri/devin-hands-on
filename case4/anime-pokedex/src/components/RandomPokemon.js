/**
 * ランダムポケモンコンポーネント - 選択されたタイプからランダムなポケモンを取得・表示する
 */

import { animate } from 'animejs';

const POKEAPI_TYPE_URL = 'https://pokeapi.co/api/v2/type/';
const POKEAPI_POKEMON_URL = 'https://pokeapi.co/api/v2/pokemon/';

/**
 * 指定されたタイプのポケモン一覧を取得する
 * @param {string} typeName - タイプ名
 * @returns {Promise<Array>} このタイプのポケモン配列
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
 * ポケモンの詳細データを取得する
 * @param {string} pokemonUrl - ポケモンAPIのURL
 * @returns {Promise<Object>} ポケモン詳細データ
 */
async function fetchPokemonDetails(pokemonUrl) {
  const response = await fetch(pokemonUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch Pokemon details');
  }
  return response.json();
}

/**
 * タイプからランダムなポケモンを取得し、その詳細を返す
 * @param {string} typeName - タイプ名
 * @returns {Promise<Object>} ランダムなポケモンの詳細データ
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
 * ランダムポケモン表示コンポーネントを作成する
 * @returns {HTMLElement} ポケモン表示要素
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
 * ポケモンをアニメーション付きで表示する
 * @param {HTMLElement} container - コンテナ要素
 * @param {Object} pokemon - ポケモンデータ（id, name, image）
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
  container.style.transform = 'translateY(80px)';
  
  // Animate appearance - slide up with smoother easing
  animate(container, {
    opacity: [0, 1],
    translateY: [80, 0],
    duration: 900,
    ease: 'easeOutCubic',
  });

  // Animate glow using the ::after pseudo-element via CSS class
  // Instead of animating boxShadow (paint-heavy), we animate the overlay opacity
  const glowOverlay = imageWrapper.querySelector('.glow-overlay') || createGlowOverlay(imageWrapper);
  
  animate(glowOverlay, {
    opacity: [0, 0.8, 1, 0.6],
    scale: [0.8, 1.1, 1.05, 1],
    duration: 1400,
    ease: 'easeInOutCubic',
  });
}

/**
 * 滑らかなアニメーション用のグローオーバーレイ要素を作成する
 * @param {HTMLElement} wrapper - 画像ラッパー要素
 * @returns {HTMLElement} グローオーバーレイ要素
 */
function createGlowOverlay(wrapper) {
  const overlay = document.createElement('div');
  overlay.className = 'glow-overlay';
  overlay.style.cssText = `
    position: absolute;
    top: -20px;
    left: -20px;
    right: -20px;
    bottom: -20px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(100, 200, 255, 0.6) 0%, rgba(255, 255, 255, 0.3) 30%, transparent 70%);
    opacity: 0;
    pointer-events: none;
    will-change: opacity, transform;
  `;
  wrapper.appendChild(overlay);
  return overlay;
}

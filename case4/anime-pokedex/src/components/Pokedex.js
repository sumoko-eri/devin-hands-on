/**
 * Pokedex component - Creates a retro Pokedex UI frame with scroll-triggered opening animation
 */

import { animate } from 'animejs';
import { createTypeSelector } from './TypeSelector.js';
import { getRandomPokemon, createRandomPokemonDisplay, displayPokemon } from './RandomPokemon.js';
import { createHologram } from './Hologram.js';

export function createPokedex() {
  const pokedex = document.createElement('div');
  pokedex.className = 'pokedex';
  pokedex.innerHTML = `
    <div class="pokedex-book">
      <div class="pokedex-hint">Scroll to open</div>
      <div class="pokedex-page pokedex-page-left">
        <div class="page-inner">
          <div class="pokedex-logo">
            <div class="pokedex-circle"></div>
            <div class="pokedex-lights">
              <span class="light red"></span>
              <span class="light yellow"></span>
              <span class="light green"></span>
            </div>
          </div>
          <div class="pokedex-title">Poké</div>
        </div>
      </div>
      <div class="pokedex-page pokedex-page-right">
        <div class="page-inner">
          <div class="pokedex-title">dex</div>
        </div>
      </div>
      <div class="pokedex-content hidden">
        <div class="pokedex-frame">
          <div class="pokedex-header">
            <div class="pokedex-lights">
              <span class="light red"></span>
              <span class="light yellow"></span>
              <span class="light green"></span>
            </div>
          </div>
          <div class="pokedex-screen">
            <div class="type-selector-wrapper">
              <!-- Type selector will be injected here -->
            </div>
            <div class="pokemon-display hidden">
              <!-- Pokemon display will be added here -->
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Get references
  const book = pokedex.querySelector('.pokedex-book');
  const leftPage = pokedex.querySelector('.pokedex-page-left');
  const rightPage = pokedex.querySelector('.pokedex-page-right');
  const content = pokedex.querySelector('.pokedex-content');
  const hint = pokedex.querySelector('.pokedex-hint');
  const typeSelectorWrapper = pokedex.querySelector('.type-selector-wrapper');
  const pokemonDisplayArea = pokedex.querySelector('.pokemon-display');

  // Flag to track if pokedex has been opened
  let isOpened = false;
  let isAnimating = false;

  // Scroll handler to trigger opening animation
  const handleScroll = (e) => {
    if (isOpened || isAnimating) return;
    
    // Prevent page scroll during animation
    e.preventDefault();
    isAnimating = true;

    // Hide hint
    animate(hint, {
      opacity: [1, 0],
      duration: 300,
      ease: 'outQuad',
    });

    // Animate left page opening (rotate from right edge)
    animate(leftPage, {
      rotateY: [0, -180],
      duration: 1000,
      ease: 'inOutQuad',
    });

    // Animate right page opening (rotate from left edge)
    animate(rightPage, {
      rotateY: [0, 180],
      duration: 1000,
      ease: 'inOutQuad',
    });

    // After pages open, show content
    setTimeout(() => {
      leftPage.classList.add('hidden');
      rightPage.classList.add('hidden');
      content.classList.remove('hidden');
      
      // Fade in content
      animate(content, {
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 500,
        ease: 'outQuad',
      });

      isOpened = true;
      isAnimating = false;
      
      // Remove scroll listener after opening
      window.removeEventListener('wheel', handleScroll, { passive: false });
      window.removeEventListener('touchmove', handleScroll, { passive: false });
    }, 1000);
  };

  // Add scroll listener when component is mounted
  setTimeout(() => {
    window.addEventListener('wheel', handleScroll, { passive: false });
    window.addEventListener('touchmove', handleScroll, { passive: false });
  }, 100);

  // Create Pokemon display component
  const pokemonDisplay = createRandomPokemonDisplay();
  pokemonDisplayArea.appendChild(pokemonDisplay);

  // Track current type for Next button functionality
  let currentType = null;

  // Function to show Pokemon and hologram
  async function showPokemonWithHologram(typeName) {
    currentType = typeName;
    
    // Show loading state
    typeSelectorWrapper.classList.add('hidden');
    pokemonDisplayArea.classList.remove('hidden');
    pokemonDisplay.innerHTML = '<p class="loading-pokemon">Loading...</p>';
    
    try {
      // Fetch random Pokemon of this type
      const pokemon = await getRandomPokemon(typeName);
      
      // Recreate display structure and show Pokemon
      pokemonDisplay.innerHTML = `
        <div class="pokemon-image-wrapper">
          <img class="pokemon-image" src="" alt="" />
        </div>
        <div class="pokemon-info">
          <span class="pokemon-number"></span>
          <span class="pokemon-name"></span>
        </div>
        <button class="back-btn">Back to Types</button>
      `;
      
      displayPokemon(pokemonDisplay, pokemon);
      
      // Show hologram after a short delay
      setTimeout(async () => {
        const hologram = await createHologram(pokemon, {
          onClose: () => {
            // Hologram closed - do nothing special
          },
          onNext: () => {
            // Fetch new random Pokemon from same type and re-display
            showPokemonWithHologram(currentType);
          }
        });
        document.body.appendChild(hologram);
      }, 1000);
      
      // Add back button handler
      pokemonDisplay.querySelector('.back-btn').addEventListener('click', () => {
        pokemonDisplayArea.classList.add('hidden');
        typeSelectorWrapper.classList.remove('hidden');
      });
    } catch (error) {
      pokemonDisplay.innerHTML = `<p class="error-text">Error: ${error.message}</p>`;
    }
  }

  // Inject TypeSelector component
  const typeSelector = createTypeSelector(async (selectedType) => {
    console.log('Selected type:', selectedType);
    showPokemonWithHologram(selectedType);
  });
  typeSelectorWrapper.appendChild(typeSelector);

  return pokedex;
}

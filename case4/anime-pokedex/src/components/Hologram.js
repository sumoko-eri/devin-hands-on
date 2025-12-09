/**
 * Hologram component - Displays Pokemon info in a hologram-style panel
 */

import { animate, createTimeline } from 'animejs';

const POKEAPI_POKEMON_URL = 'https://pokeapi.co/api/v2/pokemon/';
const POKEAPI_SPECIES_URL = 'https://pokeapi.co/api/v2/pokemon-species/';

/**
 * Fetches detailed Pokemon data including weight and height
 * @param {number} id - Pokemon ID
 * @returns {Promise<Object>} Pokemon details
 */
async function fetchPokemonDetails(id) {
  const response = await fetch(`${POKEAPI_POKEMON_URL}${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch Pokemon details');
  }
  return response.json();
}

/**
 * Fetches Pokemon species data for flavor text
 * @param {number} id - Pokemon ID
 * @returns {Promise<Object>} Species data
 */
async function fetchPokemonSpecies(id) {
  const response = await fetch(`${POKEAPI_SPECIES_URL}${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch Pokemon species');
  }
  return response.json();
}

/**
 * Gets the latest flavor text in Japanese or English
 * @param {Array} flavorTextEntries - Array of flavor text entries
 * @returns {string} The flavor text
 */
function getLatestFlavorText(flavorTextEntries) {
  // Try to find Japanese flavor text first
  const japaneseEntry = flavorTextEntries.find(entry => entry.language.name === 'ja');
  if (japaneseEntry) {
    return japaneseEntry.flavor_text.replace(/\n|\f/g, ' ');
  }
  
  // Fall back to English
  const englishEntry = flavorTextEntries.find(entry => entry.language.name === 'en');
  if (englishEntry) {
    return englishEntry.flavor_text.replace(/\n|\f/g, ' ');
  }
  
  return 'No description available.';
}

/**
 * Formats Pokemon types as a string
 * @param {Array} types - Array of type objects
 * @returns {string} Formatted types
 */
function formatTypes(types) {
  return types.map(t => t.type.name).join(' / ');
}

/**
 * Creates the Hologram panel component
 * @param {Object} pokemon - Basic Pokemon data (id, name, image)
 * @param {Object} options - Options object
 * @param {Function} options.onClose - Callback when close button is clicked
 * @param {Function} options.onNext - Callback when next button is clicked
 * @returns {HTMLElement} The hologram element
 */
export async function createHologram(pokemon, options = {}) {
  const { onClose, onNext } = options;
  
  const container = document.createElement('div');
  container.className = 'hologram-container';
  container.innerHTML = `
    <div class="hologram-panel">
      <button class="hologram-close">✕</button>
      
      <!-- SVG for connection lines -->
      <svg class="hologram-lines" viewBox="0 0 700 400" preserveAspectRatio="none">
        <!-- Line to header -->
        <line class="holo-line line-header" x1="180" y1="150" x2="100" y2="30" />
        <!-- Line to stats -->
        <line class="holo-line line-stats" x1="180" y1="200" x2="100" y2="320" />
        <!-- Line to description -->
        <line class="holo-line line-desc" x1="220" y1="180" x2="500" y2="180" />
      </svg>
      
      <div class="hologram-content">
        <div class="hologram-left">
          <div class="hologram-header holo-panel">
            <span class="hologram-number">No.<span class="pokedex-id-number" data-target-id="${pokemon.id}">0000</span></span>
            <span class="hologram-name">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</span>
          </div>
          <div class="hologram-image">
            <img src="${pokemon.image}" alt="${pokemon.name}" />
          </div>
          <div class="hologram-stats holo-panel">
            <p class="loading-text">Loading stats...</p>
          </div>
        </div>
        <div class="hologram-right">
          <div class="hologram-description holo-panel">
            <p class="loading-text">Loading description...</p>
          </div>
        </div>
      </div>
      
      <!-- Next button -->
      <button class="hologram-next">Next</button>
    </div>
  `;

  // Add close button handler
  const closeBtn = container.querySelector('.hologram-close');
  closeBtn.addEventListener('click', async () => {
    // Fade out animation with smoother easing
    const closeAnim = animate(container, {
      opacity: [1, 0],
      scale: [1, 0.95],
      duration: 400,
      ease: 'easeInCubic',
    });
    await closeAnim.finished;
    if (onClose) onClose();
    container.remove();
  });

  // Add next button handler
  const nextBtn = container.querySelector('.hologram-next');
  nextBtn.addEventListener('click', async () => {
    // Fade out animation with smoother easing
    const nextAnim = animate(container, {
      opacity: [1, 0],
      scale: [1, 0.95],
      duration: 400,
      ease: 'easeInCubic',
    });
    await nextAnim.finished;
    container.remove();
    if (onNext) onNext();
  });

  // Fetch additional data
  try {
    const [details, species] = await Promise.all([
      fetchPokemonDetails(pokemon.id),
      fetchPokemonSpecies(pokemon.id)
    ]);

    // Update stats
    const statsEl = container.querySelector('.hologram-stats');
    statsEl.innerHTML = `
      <p><span class="stat-label">Type:</span> ${formatTypes(details.types)}</p>
      <p><span class="stat-label">Height:</span> ${(details.height / 10).toFixed(1)} m</p>
      <p><span class="stat-label">Weight:</span> ${(details.weight / 10).toFixed(1)} kg</p>
    `;

    // Update description
    const descEl = container.querySelector('.hologram-description');
    const flavorText = getLatestFlavorText(species.flavor_text_entries);
    descEl.innerHTML = `<p>${flavorText}</p>`;
  } catch (error) {
    console.error('Failed to fetch Pokemon data:', error);
    const statsEl = container.querySelector('.hologram-stats');
    statsEl.innerHTML = '<p class="error-text">Failed to load stats</p>';
    const descEl = container.querySelector('.hologram-description');
    descEl.innerHTML = '<p class="error-text">Failed to load description</p>';
  }

  // Set initial states for animation
  container.style.opacity = '0';
  const panels = container.querySelectorAll('.holo-panel');
  const image = container.querySelector('.hologram-image');
  
  panels.forEach(panel => {
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(10px)';
  });
  
  image.style.opacity = '0';
  image.style.transform = 'scale(0.8)';

  // Function to start animations after container is in DOM
  const startAnimations = () => {
    // Initialize line stroke-dasharray/offset after element is rendered
    const lines = container.querySelectorAll('.holo-line');
    lines.forEach(line => {
      const length = 200; // Fixed length for animation
      line.style.strokeDasharray = length;
      line.style.strokeDashoffset = length;
    });

    // Create timeline animation with smoother defaults
    const timeline = createTimeline({
      defaults: {
        ease: 'easeOutCubic',
      }
    });

    // Container fade in - smoother and slightly longer
    timeline.add(container, {
      opacity: [0, 1],
      duration: 400,
      ease: 'easeOutCubic',
    }, 0);

    // Image appears with glow - smoother easing
    timeline.add(image, {
      opacity: [0, 1],
      scale: [0.9, 1],
      duration: 500,
      ease: 'easeOutCubic',
    }, 200);

    // Lines extend with "ビッ" effect - slightly longer for smoother feel
    const lineHeader = container.querySelector('.line-header');
    const lineStats = container.querySelector('.line-stats');
    const lineDesc = container.querySelector('.line-desc');

    timeline.add(lineHeader, {
      strokeDashoffset: [200, 0],
      duration: 350,
      ease: 'easeOutQuart',
    }, 550);

    timeline.add(lineStats, {
      strokeDashoffset: [200, 0],
      duration: 350,
      ease: 'easeOutQuart',
    }, 620);

    timeline.add(lineDesc, {
      strokeDashoffset: [300, 0],
      duration: 400,
      ease: 'easeOutQuart',
    }, 690);

    // Header panel fades in - smoother with staggered timing
    timeline.add(container.querySelector('.hologram-header'), {
      opacity: [0, 1],
      translateY: [15, 0],
      duration: 400,
      ease: 'easeOutCubic',
    }, 800);

    // Pokedex ID counter animation - digital count-up effect
    // Use separate animate() call with onUpdate for proper counter animation in anime.js v4
    const idNumberElement = container.querySelector('.pokedex-id-number');
    const targetId = parseInt(idNumberElement.getAttribute('data-target-id'), 10);
    
    // Start counter animation after header panel starts fading in (800ms delay)
    setTimeout(() => {
      const counterObj = { value: 0 };
      animate(counterObj, {
        value: targetId,
        duration: 1000,
        ease: 'easeOutExpo',
        onUpdate: () => {
          // Format with 3-digit zero-padding (or 4-digit if ID > 999)
          const paddedValue = String(Math.round(counterObj.value)).padStart(
            targetId > 999 ? 4 : 3, 
            '0'
          );
          idNumberElement.textContent = paddedValue;
        }
      });
    }, 800);

    // Stats panel fades in
    timeline.add(container.querySelector('.hologram-stats'), {
      opacity: [0, 1],
      translateY: [15, 0],
      duration: 400,
      ease: 'easeOutCubic',
    }, 880);

    // Description panel fades in
    timeline.add(container.querySelector('.hologram-description'), {
      opacity: [0, 1],
      translateY: [15, 0],
      duration: 400,
      ease: 'easeOutCubic',
    }, 960);
  };

  // Start animations on next frame (after DOM insertion)
  requestAnimationFrame(() => {
    requestAnimationFrame(startAnimations);
  });

  return container;
}

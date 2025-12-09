/**
 * タイプセレクターコンポーネント - PokéAPIからポケモンタイプを取得・表示する
 */

const POKEAPI_TYPES_URL = 'https://pokeapi.co/api/v2/type/';

/**
 * PokéAPIから全てのポケモンタイプを取得する
 * @returns {Promise<Array>} タイプオブジェクトの配列
 */
async function fetchTypes() {
  const response = await fetch(POKEAPI_TYPES_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch types');
  }
  const data = await response.json();
  // Filter out "unknown" and "shadow" types which are not standard
  return data.results.filter(type => !['unknown', 'shadow'].includes(type.name));
}

/**
 * タイプセレクターコンポーネントを作成する
 * @param {Function} onTypeSelect - タイプ選択時のコールバック
 * @returns {HTMLElement} タイプセレクター要素
 */
export function createTypeSelector(onTypeSelect) {
  const container = document.createElement('div');
  container.className = 'type-selector-container';
  container.innerHTML = '<p class="loading-text">Loading types...</p>';

  // Fetch and render types
  fetchTypes()
    .then(types => {
      container.innerHTML = `
        <h2 class="type-selector-title">Select a Type</h2>
        <div class="type-grid">
          ${types.map(type => `
            <button class="type-btn type-${type.name}" data-type="${type.name}">
              ${type.name}
            </button>
          `).join('')}
        </div>
      `;

      // Add click handlers
      container.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const typeName = btn.dataset.type;
          // Remove selected class from all buttons
          container.querySelectorAll('.type-btn').forEach(b => b.classList.remove('selected'));
          // Add selected class to clicked button
          btn.classList.add('selected');
          // Call the callback
          if (onTypeSelect) {
            onTypeSelect(typeName);
          }
        });
      });
    })
    .catch(error => {
      container.innerHTML = `<p class="error-text">Error: ${error.message}</p>`;
    });

  return container;
}

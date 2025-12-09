#!/usr/bin/env node

const axios = require('axios');
const { program } = require('commander');
const chalk = require('chalk');

const WTTR_BASE_URL = 'https://wttr.in';

/**
 * Colorizes JSON output for better readability
 * @param {object} obj - The object to colorize
 * @param {number} indent - Current indentation level
 * @returns {string} Colorized JSON string
 */
function colorizeJson(obj, indent = 0) {
  const spaces = '  '.repeat(indent);
  
  if (obj === null) {
    return chalk.gray('null');
  }
  
  if (typeof obj === 'boolean') {
    return chalk.yellow(obj.toString());
  }
  
  if (typeof obj === 'number') {
    return chalk.cyan(obj.toString());
  }
  
  if (typeof obj === 'string') {
    return chalk.green(`"${obj}"`);
  }
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return '[]';
    }
    const items = obj.map(item => `${spaces}  ${colorizeJson(item, indent + 1)}`);
    return `[\n${items.join(',\n')}\n${spaces}]`;
  }
  
  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      return '{}';
    }
    const items = keys.map(key => {
      const coloredKey = chalk.magenta(`"${key}"`);
      const coloredValue = colorizeJson(obj[key], indent + 1);
      return `${spaces}  ${coloredKey}: ${coloredValue}`;
    });
    return `{\n${items.join(',\n')}\n${spaces}}`;
  }
  
  return String(obj);
}

/**
 * Fetches weather data for a given city from wttr.in API
 * @param {string} city - The city name to fetch weather for
 * @returns {Promise<object>} Weather data in JSON format
 * @throws {Error} If city is not provided or API call fails
 */
async function fetchWeather(city) {
  if (!city || typeof city !== 'string' || city.trim() === '') {
    throw new Error('City name is required');
  }

  const url = `${WTTR_BASE_URL}/${encodeURIComponent(city.trim())}?format=j1`;

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'weather-cli/1.0.0'
      }
    });

    if (!response.data) {
      throw new Error('Empty response from weather API');
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`API error: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout: Weather API did not respond in time');
    } else if (error.code === 'ENOTFOUND') {
      throw new Error('Network error: Unable to reach weather API');
    }
    throw error;
  }
}

/**
 * Main CLI entry point
 */
async function main() {
  program
    .name('weather')
    .description('CLI tool to fetch weather information')
    .version('1.0.0')
    .argument('<city>', 'City name to fetch weather for')
    .action(async (city) => {
      try {
        const weatherData = await fetchWeather(city);
        console.log(colorizeJson(weatherData));
      } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
      }
    });

  await program.parseAsync(process.argv);
}

if (require.main === module) {
  main();
}

module.exports = { fetchWeather, WTTR_BASE_URL };

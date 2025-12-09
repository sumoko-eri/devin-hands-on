const axios = require('axios');
const { fetchWeather, WTTR_BASE_URL } = require('../utils/weather');

jest.mock('axios');

describe('weather module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchWeather', () => {
    describe('argument validation', () => {
      test('throws error when city is not provided', async () => {
        await expect(fetchWeather()).rejects.toThrow('City name is required');
      });

      test('throws error when city is null', async () => {
        await expect(fetchWeather(null)).rejects.toThrow('City name is required');
      });

      test('throws error when city is empty string', async () => {
        await expect(fetchWeather('')).rejects.toThrow('City name is required');
      });

      test('throws error when city is whitespace only', async () => {
        await expect(fetchWeather('   ')).rejects.toThrow('City name is required');
      });

      test('throws error when city is not a string', async () => {
        await expect(fetchWeather(123)).rejects.toThrow('City name is required');
      });
    });

    describe('successful API response', () => {
      const mockWeatherData = {
        current_condition: [
          {
            temp_C: '20',
            weatherDesc: [{ value: 'Sunny' }]
          }
        ],
        nearest_area: [
          {
            areaName: [{ value: 'Hiroshima' }],
            country: [{ value: 'Japan' }]
          }
        ]
      };

      test('returns weather data for valid city', async () => {
        axios.get.mockResolvedValue({ data: mockWeatherData });

        const result = await fetchWeather('Hiroshima');

        expect(result).toEqual(mockWeatherData);
        expect(axios.get).toHaveBeenCalledWith(
          `${WTTR_BASE_URL}/Hiroshima?format=j1`,
          expect.objectContaining({
            timeout: 10000,
            headers: { 'User-Agent': 'weather-cli/1.0.0' }
          })
        );
      });

      test('trims whitespace from city name', async () => {
        axios.get.mockResolvedValue({ data: mockWeatherData });

        await fetchWeather('  Hiroshima  ');

        expect(axios.get).toHaveBeenCalledWith(
          `${WTTR_BASE_URL}/Hiroshima?format=j1`,
          expect.any(Object)
        );
      });

      test('encodes special characters in city name', async () => {
        axios.get.mockResolvedValue({ data: mockWeatherData });

        await fetchWeather('New York');

        expect(axios.get).toHaveBeenCalledWith(
          `${WTTR_BASE_URL}/New%20York?format=j1`,
          expect.any(Object)
        );
      });
    });

    describe('error handling', () => {
      test('throws error when API returns empty response', async () => {
        axios.get.mockResolvedValue({ data: null });

        await expect(fetchWeather('Hiroshima')).rejects.toThrow('Empty response from weather API');
      });

      test('throws error with status code on API error response', async () => {
        axios.get.mockRejectedValue({
          response: {
            status: 404,
            statusText: 'Not Found'
          }
        });

        await expect(fetchWeather('InvalidCity')).rejects.toThrow('API error: 404 - Not Found');
      });

      test('throws timeout error when request times out', async () => {
        axios.get.mockRejectedValue({
          code: 'ECONNABORTED'
        });

        await expect(fetchWeather('Hiroshima')).rejects.toThrow('Request timeout: Weather API did not respond in time');
      });

      test('throws network error when unable to reach API', async () => {
        axios.get.mockRejectedValue({
          code: 'ENOTFOUND'
        });

        await expect(fetchWeather('Hiroshima')).rejects.toThrow('Network error: Unable to reach weather API');
      });

      test('re-throws unknown errors', async () => {
        const unknownError = new Error('Unknown error');
        axios.get.mockRejectedValue(unknownError);

        await expect(fetchWeather('Hiroshima')).rejects.toThrow('Unknown error');
      });
    });
  });

  describe('module exports', () => {
    test('exports fetchWeather function', () => {
      expect(typeof fetchWeather).toBe('function');
    });

    test('exports WTTR_BASE_URL constant', () => {
      expect(WTTR_BASE_URL).toBe('https://wttr.in');
    });
  });
});

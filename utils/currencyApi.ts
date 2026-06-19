import axios from 'axios';

// Monedas soportadas
export const currencies = {
  USD: 'Dólar Americano',
  EUR: 'Euro',
  MXN: 'Peso Mexicano',
  JPY: 'Yen Japonés',
  GBP: 'Libra Esterlina',
  CAD: 'Dólar Canadiense',
  AUD: 'Dólar Australiano',
  CHF: 'Franco Suizo',
  CNY: 'Yuan Chino',
  BRL: 'Real Brasileño',
  ARS: 'Peso Argentino',
  CLP: 'Peso Chileno',
  COP: 'Peso Colombiano',
  PEN: 'Sol Peruano',
};

// API gratuita - reemplaza con tu API key
const API_KEY = 'YOUR_API_KEY'; // Obtén tu API key de exchangerate-api.com
const BASE_URL = 'https://v6.exchangerate-api.com/v6';

export const getExchangeRates = async (baseCurrency: string) => {
  try {
    // Si no hay API key, usa datos de ejemplo
    if (API_KEY === 'YOUR_API_KEY') {
      console.warn('Usando datos de ejemplo - Obtén una API key de exchangerate-api.com');
      return getMockRates(baseCurrency);
    }

    const response = await axios.get(`${BASE_URL}/${API_KEY}/latest/${baseCurrency}`);
    
    if (response.data.result === 'success') {
      return response.data;
    } else {
      throw new Error('Error al obtener tasas de cambio');
    }
  } catch (error) {
    console.error('Error en getExchangeRates:', error);
    // Fallback a datos mock si la API falla
    return getMockRates(baseCurrency);
  }
};

// Datos de ejemplo para pruebas sin API key
const getMockRates = (base: string) => {
  const mockRates: { [key: string]: number } = {
    USD: 1,
    EUR: 0.85,
    MXN: 17.5,
    JPY: 148.5,
    GBP: 0.79,
    CAD: 1.35,
    AUD: 1.52,
    CHF: 0.88,
    CNY: 7.19,
    BRL: 4.95,
    ARS: 825.5,
    CLP: 935,
    COP: 3920,
    PEN: 3.72,
  };

  // Ajustar tasas basado en la moneda base
  const baseRate = mockRates[base] || 1;
  const rates: { [key: string]: number } = {};
  
  Object.keys(mockRates).forEach(key => {
    rates[key] = mockRates[key] / baseRate;
  });

  return {
    result: 'success',
    base_code: base,
    conversion_rates: rates,
    time_last_update_utc: new Date().toISOString(),
  };
};
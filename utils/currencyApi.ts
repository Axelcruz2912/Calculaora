import axios from "axios";

/* =========================
   MONEDAS SOPORTADAS
========================= */
export const currencies: Record<string, string> = {
  USD: "Dólar Americano",
  EUR: "Euro",
  MXN: "Peso Mexicano",
  JPY: "Yen Japonés",
  GBP: "Libra Esterlina",
  CAD: "Dólar Canadiense",
  AUD: "Dólar Australiano",
  CHF: "Franco Suizo",
  CNY: "Yuan Chino",
  BRL: "Real Brasileño",
  ARS: "Peso Argentino",
  CLP: "Peso Chileno",
  COP: "Peso Colombiano",
  PEN: "Sol Peruano",
};

/* =========================
   CONFIGURACIÓN API
   (puedes dejarla así o cambiarla)
========================= */
const API_KEY = "DEMO_MODE"; // modo sin clave real
const BASE_URL = "https://v6.exchangerate-api.com/v6";

/* =========================
   FUNCIÓN PRINCIPAL
========================= */
export const getExchangeRates = async (baseCurrency: string) => {
  try {
    // 🔹 MODO DEMO (sin API real)
    if (API_KEY === "DEMO_MODE") {
      console.warn("Modo demo activado: usando datos simulados");
      return getMockRates(baseCurrency);
    }

    // 🔹 API REAL (si algún día agregas key)
    const response = await axios.get(
      `${BASE_URL}/${API_KEY}/latest/${baseCurrency}`
    );

    if (response.data?.result === "success") {
      return response.data;
    }

    throw new Error("Error al obtener tasas de cambio desde la API");
  } catch (error) {
    console.error("Error en getExchangeRates:", error);

    // 🔹 FALLBACK (si la API falla)
    return getMockRates(baseCurrency);
  }
};

/* =========================
   DATOS SIMULADOS (OFFLINE)
========================= */
const getMockRates = (base: string) => {
  const mockRates: Record<string, number> = {
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

  // 🔹 Ajuste según moneda base
  const baseRate = mockRates[base] || 1;
  const rates: Record<string, number> = {};

  Object.keys(mockRates).forEach((key) => {
    rates[key] = mockRates[key] / baseRate;
  });

  return {
    result: "success",
    base_code: base,
    conversion_rates: rates,
    time_last_update_utc: new Date().toISOString(),
    source: "mock_data",
  };
};
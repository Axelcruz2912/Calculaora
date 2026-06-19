export const CURRENCIES = {
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
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-ZM', {
    style: 'currency',
    currency: 'ZMW',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatPercentage = (value) => {
  return `${Number(value).toFixed(1)}%`;
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-ZM', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}; 
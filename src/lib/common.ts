export const CURRENCY = '€';

export const getCurrentDateTime = (date?: string) => {
  const currentDate = date ? new Date(date) : new Date();
  const offset = currentDate.getTimezoneOffset();
  const currentOffsetDate = new Date(currentDate.getTime() - (offset * 60 * 1000));
  return currentOffsetDate.toISOString().split('.')[0];
}

export const getCurrentDate = (date?: string) => {
  return getCurrentDateTime(date).split('T')[0];
}

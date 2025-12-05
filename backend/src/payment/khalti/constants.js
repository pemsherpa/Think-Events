export const KHALTI_STATUS = {
  COMPLETED: 'Completed',
  PENDING: 'Pending',
  INITIATED: 'Initiated',
  REFUNDED: 'Refunded',
  PARTIALLY_REFUNDED: 'Partially refunded',
  EXPIRED: 'Expired',
  USER_CANCELED: 'User canceled',
};

export const KHALTI_ENDPOINTS = {
  INITIATE: '/epayment/initiate/',
  LOOKUP: '/epayment/lookup/',
};

export default {
  KHALTI_STATUS,
  KHALTI_ENDPOINTS,
};


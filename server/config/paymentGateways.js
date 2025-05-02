/**
 * Payment Gateway Configuration
 * 
 * This file contains configuration for different payment gateways.
 * Replace placeholder values with actual credentials from your payment gateway accounts.
 */

const config = {
  // JazzCash Configuration
  jazzCash: {
    merchantId: process.env.JAZZCASH_MERCHANT_ID || 'MC12345',
    password: process.env.JAZZCASH_PASSWORD || 'password123',
    integrityKey: process.env.JAZZCASH_INTEGRITY_KEY || 'integrity_key_123',
    returnUrl: process.env.JAZZCASH_RETURN_URL || 'http://localhost:5000/api/payments/jazzcash/callback',
    isProduction: process.env.NODE_ENV === 'production',
    apiBaseUrl: process.env.NODE_ENV === 'production' 
      ? 'https://payments.jazzcash.com.pk/ApplicationAPI/API/Payment/DoTransaction'
      : 'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/Payment/DoTransaction'
  },
  
  // EasyPaisa Configuration
  easyPaisa: {
    merchantId: process.env.EASYPAISA_MERCHANT_ID || 'EP12345',
    accountNumber: process.env.EASYPAISA_ACCOUNT_NUMBER || '03001234567',
    storeId: process.env.EASYPAISA_STORE_ID || 'STORE123',
    secretKey: process.env.EASYPAISA_SECRET_KEY || 'secret_key_123',
    returnUrl: process.env.EASYPAISA_RETURN_URL || 'http://localhost:5000/api/payments/easypaisa/callback',
    isProduction: process.env.NODE_ENV === 'production',
    apiBaseUrl: process.env.NODE_ENV === 'production'
      ? 'https://easypay.easypaisa.com.pk/easypay/Index.jsf'
      : 'https://easypaystg.easypaisa.com.pk/easypay/Index.jsf'
  },
  
  // PayFast Configuration
  payFast: {
    merchantId: process.env.PAYFAST_MERCHANT_ID || 'PF12345',
    merchantKey: process.env.PAYFAST_MERCHANT_KEY || 'merchant_key_123',
    passphrase: process.env.PAYFAST_PASSPHRASE || 'passphrase_123',
    returnUrl: process.env.PAYFAST_RETURN_URL || 'http://localhost:5000/api/payments/payfast/callback',
    cancelUrl: process.env.PAYFAST_CANCEL_URL || 'http://localhost:5000/api/payments/payfast/cancel',
    notifyUrl: process.env.PAYFAST_NOTIFY_URL || 'http://localhost:5000/api/payments/payfast/notify',
    isProduction: process.env.NODE_ENV === 'production',
    apiBaseUrl: process.env.NODE_ENV === 'production'
      ? 'https://www.payfast.co.za/eng/process'
      : 'https://sandbox.payfast.co.za/eng/process'
  }
};

module.exports = config;

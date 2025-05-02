const axios = require('axios');
const crypto = require('crypto');
const config = require('../config/paymentGateways').payFast;

/**
 * PayFast Payment Gateway Service
 */
class PayFastService {
  /**
   * Generate a secure signature for PayFast API
   * @param {Object} data - Payment data
   * @returns {String} - Signature string
   */
  generateSignature(data) {
    // Sort the object by key
    const sortedData = {};
    Object.keys(data).sort().forEach(key => {
      sortedData[key] = data[key];
    });
    
    // Create a query string
    const queryString = Object.entries(sortedData)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    // Generate signature
    return crypto.createHash('md5')
      .update(queryString + config.passphrase)
      .digest('hex');
  }
  
  /**
   * Create a payment request to PayFast
   * @param {Object} paymentData - Payment details
   * @returns {Object} - Payment form data and URL
   */
  async createPaymentRequest(paymentData) {
    try {
      // Generate merchant reference
      const merchantReference = `REF-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
      
      // Prepare data for PayFast API
      const data = {
        merchant_id: config.merchantId,
        merchant_key: config.merchantKey,
        return_url: config.returnUrl,
        cancel_url: config.cancelUrl,
        notify_url: config.notifyUrl,
        name_first: paymentData.firstName || 'Customer',
        name_last: paymentData.lastName || '',
        email_address: paymentData.email || 'customer@example.com',
        m_payment_id: merchantReference,
        amount: paymentData.amount.toFixed(2),
        item_name: paymentData.description || 'Payment for services',
        item_description: paymentData.description || 'Payment for services',
        custom_str1: paymentData.userId || '',
        custom_str2: paymentData.purpose || '',
        custom_str3: paymentData.referenceId || '',
        custom_str4: paymentData.referenceModel || '',
        custom_str5: ''
      };
      
      // Generate signature
      data.signature = this.generateSignature(data);
      
      return {
        formData: data,
        paymentUrl: config.apiBaseUrl,
        transactionId: merchantReference
      };
    } catch (error) {
      console.error('Error creating PayFast payment request:', error);
      throw new Error('Failed to create payment request');
    }
  }
  
  /**
   * Verify PayFast payment notification (ITN)
   * @param {Object} notificationData - Notification data from PayFast
   * @param {String} requestIP - IP address of the request
   * @returns {Object} - Verification result
   */
  async verifyPaymentNotification(notificationData, requestIP) {
    try {
      // Verify source IP (PayFast servers)
      const payFastIPs = [
        '197.97.145.144', '197.97.145.145', '197.97.145.146', '197.97.145.147',
        '197.97.145.148', '197.97.145.149', '197.97.145.150', '197.97.145.151',
        '197.97.145.152', '197.97.145.153', '197.97.145.154', '197.97.145.155',
        '197.97.145.156', '197.97.145.157'
      ];
      
      // Skip IP verification in development
      const isValidIP = !config.isProduction || payFastIPs.includes(requestIP);
      if (!isValidIP) {
        return {
          isValid: false,
          isSuccessful: false,
          responseMessage: 'Invalid source IP'
        };
      }
      
      // Create a copy of the data without the signature
      const dataForSignature = { ...notificationData };
      delete dataForSignature.signature;
      
      // Generate signature for verification
      const calculatedSignature = this.generateSignature(dataForSignature);
      
      // Verify signature
      const isValidSignature = calculatedSignature === notificationData.signature;
      
      // Verify data with PayFast (in production)
      let isVerified = true;
      if (config.isProduction) {
        try {
          const verifyUrl = 'https://www.payfast.co.za/eng/query/validate';
          const response = await axios.post(verifyUrl, notificationData, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });
          
          isVerified = response.data.trim() === 'VALID';
        } catch (error) {
          console.error('Error verifying with PayFast:', error);
          isVerified = false;
        }
      }
      
      // Check if payment was successful
      const isSuccessful = notificationData.payment_status === 'COMPLETE';
      
      return {
        isValid: isValidSignature && isVerified,
        isSuccessful,
        transactionId: notificationData.m_payment_id,
        payFastPaymentId: notificationData.pf_payment_id,
        responseCode: notificationData.payment_status,
        responseMessage: notificationData.payment_status,
        amount: parseFloat(notificationData.amount_gross),
        userId: notificationData.custom_str1,
        purpose: notificationData.custom_str2,
        referenceId: notificationData.custom_str3,
        referenceModel: notificationData.custom_str4,
        rawData: notificationData
      };
    } catch (error) {
      console.error('Error verifying PayFast payment notification:', error);
      return {
        isValid: false,
        isSuccessful: false,
        responseMessage: 'Error processing payment verification'
      };
    }
  }
}

module.exports = new PayFastService();

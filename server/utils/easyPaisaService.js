const axios = require('axios');
const crypto = require('crypto');
const config = require('../config/paymentGateways').easyPaisa;

/**
 * EasyPaisa Payment Gateway Service
 */
class EasyPaisaService {
  /**
   * Generate a secure hash for EasyPaisa API
   * @param {Object} data - Payment data
   * @returns {String} - Hashed string
   */
  generateHash(data) {
    const hashString = `${data.amount}${data.storeId}${data.postBackURL}${data.orderRefNum}${config.secretKey}`;
    
    return crypto.createHash('sha256')
      .update(hashString)
      .digest('hex');
  }
  
  /**
   * Create a payment request to EasyPaisa
   * @param {Object} paymentData - Payment details
   * @returns {Object} - Payment form data and URL
   */
  async createPaymentRequest(paymentData) {
    try {
      // Generate order reference number
      const orderRefNum = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
      
      // Prepare data for EasyPaisa API
      const data = {
        storeId: config.storeId,
        amount: paymentData.amount,
        postBackURL: config.returnUrl,
        orderRefNum: orderRefNum,
        expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        merchantHashedReq: '',
        autoRedirect: 1,
        paymentMethod: 'MA_PAYMENT_METHOD',
        emailAddr: paymentData.email || '',
        mobileNum: paymentData.mobileNumber || '',
        merchantPaymentMethod: '',
        storeType: 'ECOM',
        encryptedHashRequest: ''
      };
      
      // Add custom fields for reference
      data.mobileAccountNo = '';
      data.paymentType = 'MA';
      data.tokenExpiry = '';
      data.bankIdentificationNumber = '';
      data.datamaskedCardNumber = '';
      data.mpfRequestObject = JSON.stringify({
        userId: paymentData.userId || '',
        purpose: paymentData.purpose || '',
        referenceId: paymentData.referenceId || '',
        referenceModel: paymentData.referenceModel || ''
      });
      
      // Generate secure hash
      data.merchantHashedReq = this.generateHash(data);
      
      return {
        formData: data,
        paymentUrl: config.apiBaseUrl,
        transactionId: orderRefNum
      };
    } catch (error) {
      console.error('Error creating EasyPaisa payment request:', error);
      throw new Error('Failed to create payment request');
    }
  }
  
  /**
   * Verify EasyPaisa payment callback
   * @param {Object} callbackData - Callback data from EasyPaisa
   * @returns {Object} - Verification result
   */
  verifyPaymentCallback(callbackData) {
    try {
      // Extract relevant fields for verification
      const {
        status,
        desc,
        orderRefNum,
        paymentToken,
        storeId,
        amount,
        transactionDateTime,
        merchantHashedReq
      } = callbackData;
      
      // Recreate hash data
      const hashData = {
        amount,
        storeId,
        postBackURL: config.returnUrl,
        orderRefNum
      };
      
      // Generate hash for verification
      const calculatedHash = this.generateHash(hashData);
      
      // Verify hash
      const isValidHash = calculatedHash === merchantHashedReq;
      
      // Check if payment was successful
      const isSuccessful = status === '0000';
      
      // Extract custom data
      let customData = {};
      try {
        if (callbackData.mpfRequestObject) {
          customData = JSON.parse(callbackData.mpfRequestObject);
        }
      } catch (e) {
        console.error('Error parsing custom data:', e);
      }
      
      return {
        isValid: isValidHash,
        isSuccessful,
        transactionId: orderRefNum,
        paymentToken,
        responseCode: status,
        responseMessage: desc,
        amount: parseFloat(amount),
        userId: customData.userId,
        purpose: customData.purpose,
        referenceId: customData.referenceId,
        referenceModel: customData.referenceModel,
        rawData: callbackData
      };
    } catch (error) {
      console.error('Error verifying EasyPaisa payment callback:', error);
      return {
        isValid: false,
        isSuccessful: false,
        responseMessage: 'Error processing payment verification'
      };
    }
  }
}

module.exports = new EasyPaisaService();

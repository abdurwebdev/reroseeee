const axios = require('axios');
const crypto = require('crypto');
const config = require('../config/paymentGateways').jazzCash;

/**
 * JazzCash Payment Gateway Service
 */
class JazzCashService {
  /**
   * Generate a secure hash for JazzCash API
   * @param {Object} data - Payment data
   * @returns {String} - Hashed string
   */
  generateHash(data) {
    const hashString = `${data.pp_Amount}${data.pp_BillReference}${data.pp_Description}${data.pp_Language}${data.pp_MerchantID}${data.pp_Password}${data.pp_ReturnURL}${data.pp_TxnCurrency}${data.pp_TxnDateTime}${data.pp_TxnExpiryDateTime}${data.pp_TxnRefNo}${data.pp_Version}`;
    
    return crypto.createHmac('sha256', config.integrityKey)
      .update(hashString)
      .digest('hex');
  }
  
  /**
   * Create a payment request to JazzCash
   * @param {Object} paymentData - Payment details
   * @returns {Object} - Payment form data and URL
   */
  async createPaymentRequest(paymentData) {
    try {
      // Generate transaction reference number
      const txnRefNo = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
      
      // Get current date and expiry date in required format
      const currentDate = new Date();
      const expiryDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
      
      const formattedDate = (date) => {
        return date.toISOString()
          .replace(/[-T:.Z]/g, '')
          .slice(0, 14);
      };
      
      const txnDateTime = formattedDate(currentDate);
      const txnExpiryDateTime = formattedDate(expiryDate);
      
      // Prepare data for JazzCash API
      const data = {
        pp_Version: '1.1',
        pp_TxnType: 'MWALLET',
        pp_Language: 'EN',
        pp_MerchantID: config.merchantId,
        pp_Password: config.password,
        pp_TxnRefNo: txnRefNo,
        pp_Amount: paymentData.amount * 100, // Amount in cents
        pp_TxnCurrency: 'PKR',
        pp_TxnDateTime: txnDateTime,
        pp_BillReference: paymentData.reference || 'BILLREF',
        pp_Description: paymentData.description || 'Payment for services',
        pp_TxnExpiryDateTime: txnExpiryDateTime,
        pp_ReturnURL: config.returnUrl,
        pp_SecureHash: '',
        ppmpf_1: paymentData.userId || '',
        ppmpf_2: paymentData.purpose || '',
        ppmpf_3: paymentData.referenceId || '',
        ppmpf_4: paymentData.referenceModel || '',
        ppmpf_5: ''
      };
      
      // Generate secure hash
      data.pp_SecureHash = this.generateHash(data);
      
      return {
        formData: data,
        paymentUrl: config.apiBaseUrl,
        transactionId: txnRefNo
      };
    } catch (error) {
      console.error('Error creating JazzCash payment request:', error);
      throw new Error('Failed to create payment request');
    }
  }
  
  /**
   * Verify JazzCash payment callback
   * @param {Object} callbackData - Callback data from JazzCash
   * @returns {Object} - Verification result
   */
  verifyPaymentCallback(callbackData) {
    try {
      // Extract relevant fields for hash verification
      const {
        pp_Amount,
        pp_BillReference,
        pp_Description,
        pp_Language,
        pp_MerchantID,
        pp_ResponseCode,
        pp_ResponseMessage,
        pp_ReturnURL,
        pp_SecureHash,
        pp_TxnCurrency,
        pp_TxnDateTime,
        pp_TxnExpiryDateTime,
        pp_TxnRefNo,
        pp_Version
      } = callbackData;
      
      // Recreate hash data
      const hashData = {
        pp_Amount,
        pp_BillReference,
        pp_Description,
        pp_Language,
        pp_MerchantID,
        pp_Password: config.password,
        pp_ReturnURL,
        pp_TxnCurrency,
        pp_TxnDateTime,
        pp_TxnExpiryDateTime,
        pp_TxnRefNo,
        pp_Version
      };
      
      // Generate hash for verification
      const calculatedHash = this.generateHash(hashData);
      
      // Verify hash
      const isValidHash = calculatedHash === pp_SecureHash;
      
      // Check if payment was successful
      const isSuccessful = pp_ResponseCode === '000';
      
      return {
        isValid: isValidHash,
        isSuccessful,
        transactionId: pp_TxnRefNo,
        responseCode: pp_ResponseCode,
        responseMessage: pp_ResponseMessage,
        amount: pp_Amount / 100, // Convert back to actual amount
        rawData: callbackData
      };
    } catch (error) {
      console.error('Error verifying JazzCash payment callback:', error);
      return {
        isValid: false,
        isSuccessful: false,
        responseMessage: 'Error processing payment verification'
      };
    }
  }
}

module.exports = new JazzCashService();

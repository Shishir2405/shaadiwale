// utils/paymentUtils.js

// Helper function to load external scripts
const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };
  
  export const initializeRazorpay = async (options) => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
  
    if (!res) {
      throw new Error('Razorpay SDK failed to load');
    }
  
    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: options.key,
        amount: options.amount,
        currency: options.currency || 'INR',
        name: options.name,
        description: options.description,
        order_id: options.orderId,
        handler: function (response) {
          resolve(response);
        },
        prefill: {
          name: options.customerName,
          email: options.customerEmail,
          contact: options.customerPhone
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: function() {
            reject(new Error('Payment cancelled'));
          }
        }
      });
  
      rzp.on('payment.failed', function (response) {
        reject(response.error);
      });
  
      rzp.open();
    });
  };
  
  export const initializePayUMoney = async (options) => {
    // Create the form data object
    const formData = {
      key: options.merchantKey,
      txnid: options.transactionId,
      amount: options.amount,
      productinfo: options.productInfo,
      firstname: options.customerName,
      email: options.customerEmail,
      phone: options.customerPhone,
      surl: options.successUrl,
      furl: options.failureUrl,
      hash: options.hash
    };
  
    // Create and submit form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = process.env.NODE_ENV === 'production' 
      ? 'https://secure.payu.in/_payment'
      : 'https://test.payu.in/_payment';
  
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      }
    });
  
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  
    return new Promise((resolve) => {
      // PayU Money redirects to success/failure URLs
      // Handle the response in those pages
      resolve({
        message: 'Redirecting to PayU Money...'
      });
    });
  };
  
  export const processDirectBankTransfer = async (bankDetails) => {
    // Return formatted bank details for direct transfer
    return {
      bankName: bankDetails.bankName,
      accountNumber: bankDetails.accountNumber,
      accountType: bankDetails.accountType || 'Current',
      accountName: bankDetails.accountName,
      ifscCode: bankDetails.ifscCode,
      instructions: `Please transfer the amount to the above account and share the transaction ID for confirmation.`,
      timestamp: new Date().toISOString()
    };
  };
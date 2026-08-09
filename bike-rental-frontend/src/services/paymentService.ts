import * as paymentApi from "../api/paymentApi";

export const paymentService = {
  processPayment: async (paymentReq: paymentApi.PaymentRequest) => {
    const response = await paymentApi.processPayment(paymentReq);
    return response.data.data;
  },
};

export default paymentService;
// 

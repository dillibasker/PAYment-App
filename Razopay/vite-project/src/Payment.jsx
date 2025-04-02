import React from "react";
import axios from "axios";

const Payment = () => {
  const handlePayment = async () => {
    try {
      const amount = 500; // Amount in INR

      // Create order
      const { data } = await axios.post("http://localhost:5000/api/payment/create-order", { amount });

      if (!data.success) {
        alert("Order creation failed");
        return;
      }

      const { order } = data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Razorpay Key from .env
        amount: order.amount,
        currency: order.currency,
        name: "Your Company Name",
        description: "Test Transaction",
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post("http://localhost:5000/api/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              alert("Payment successful!");
            } else {
              alert("Payment verification failed!");
            }
          } catch (error) {
            console.error("Verification error:", error);
          }
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  return (
    <div>
      <h2>Razorpay Payment</h2>
      <button onClick={handlePayment}>Pay ₹500</button>
    </div>
  );
};

export default Payment;

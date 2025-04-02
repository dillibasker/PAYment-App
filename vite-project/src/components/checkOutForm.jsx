import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (!stripe || !elements) {
      setMessage("Stripe is not loaded yet.");
      setLoading(false);
      return;
    }

    // Get the card details
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    // Send payment request to the backend
    try {
      const response = await fetch("http://localhost:5000/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 5000 }), // Charge $50 (5000 cents)
      });

      const data = await response.json();

      // Confirm payment with Stripe
      const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: paymentMethod.id,
      });

      if (confirmError) {
        setMessage(confirmError.message);
      } else if (paymentIntent.status === "succeeded") {
        setMessage("Payment Successful! 🎉");
      } else {
        setMessage("Payment failed.");
      }
    } catch (err) {
      setMessage("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-4">Enter Card Details</h2>
      <CardElement className="p-2 border rounded-md" />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
      {message && <p className="mt-2 text-red-500">{message}</p>}
    </form>
  );
};

export default CheckoutForm;

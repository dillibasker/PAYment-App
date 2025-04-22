import React, { useState, useEffect } from "react";

const Payment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    // Dynamically load the Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    // Clean up the script when component is unmounted
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      const amount = 1; // Amount in INR

      // Create order using fetch instead of axios
      const response = await fetch("http://localhost:5000/api/payment/create-order", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });
      
      const data = await response.json();
      setIsLoading(false);

      if (!data.success) {
        setPaymentStatus("error");
        setTimeout(() => setPaymentStatus(null), 3000);
        return;
      }

      const { order } = data;
      
      // Get Razorpay key from environment
      const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "your_razorpay_key_id";

      const options = {
        key: RAZORPAY_KEY_ID, // Razorpay Key from env
        amount: order.amount,
        currency: order.currency,
        name: "PayEase",
        description: "Secure Payment",
        order_id: order.id,
        handler: async (response) => {
          setIsLoading(true);
          try {
            const verifyResponse = await fetch("http://localhost:5000/api/payment/verify", {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            
            const verifyData = await verifyResponse.json();
            setIsLoading(false);

            if (verifyData.success) {
              setPaymentStatus("success");
              setTimeout(() => setPaymentStatus(null), 3000);
            } else {
              setPaymentStatus("error");
              setTimeout(() => setPaymentStatus(null), 3000);
            }
          } catch (error) {
            console.error("Verification error:", error);
            setPaymentStatus("error");
            setIsLoading(false);
            setTimeout(() => setPaymentStatus(null), 3000);
          }
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
        },
        theme: {
          color: "#6366F1",
        }
      };

      // Check if Razorpay script is loaded
      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        console.error("Razorpay script not loaded.");
        setPaymentStatus("error");
        setTimeout(() => setPaymentStatus(null), 3000);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setIsLoading(false);
      setPaymentStatus("error");
      setTimeout(() => setPaymentStatus(null), 3000);
    }
  };

  return (
    <div className="payment-container">
      <style>
        {`
          .payment-container {
            font-family: 'Poppins', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%);
            color: #fff;
            padding: 20px;
          }
          
          .payment-card {
            position: relative;
            width: 100%;
            max-width: 400px;
            perspective: 1000px;
            transition: transform 0.5s ease;
          }
          
          .payment-card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            text-align: center;
            transition: transform 0.8s;
            transform-style: preserve-3d;
            transform: ${isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'};
          }
          
          .payment-card-front, .payment-card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            padding: 30px;
          }
          
          .payment-card-front {
            background: rgba(255, 255, 255, 0.85);
            color: #1f2937;
          }
          
          .payment-card-back {
            background: rgba(255, 255, 255, 0.9);
            color: #1f2937;
            transform: rotateY(180deg);
          }
          
          .payment-logo {
            margin-bottom: 20px;
            animation: float 3s ease-in-out infinite;
          }
          
          .payment-logo h1 {
            font-size: 2rem;
            font-weight: 700;
            margin: 0;
            background: linear-gradient(90deg, #4f46e5, #7e22ce);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            position: relative;
          }
          
          .payment-logo h1::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 50%;
            transform: translateX(-50%);
            width: 50px;
            height: 3px;
            background: linear-gradient(90deg, #4f46e5, #7e22ce);
            border-radius: 10px;
          }
          
          .payment-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 20px;
            color: #1f2937;
          }
          
          .payment-amount {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 25px;
            color: #4f46e5;
            text-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }
          
          .payment-button {
            padding: 12px 30px;
            font-size: 1rem;
            font-weight: 600;
            background: linear-gradient(90deg, #4f46e5, #7e22ce);
            color: white;
            border: none;
            border-radius: 30px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
            position: relative;
            overflow: hidden;
            margin-bottom: 20px;
          }
          
          .payment-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(79, 70, 229, 0.6);
          }
          
          .payment-button:active {
            transform: translateY(0);
          }
          
          .payment-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transform: translateX(-100%);
          }
          
          .payment-button:hover::before {
            animation: shine 1.5s infinite;
          }
          
          .payment-info {
            font-size: 0.9rem;
            color: #4b5563;
            margin-top: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            cursor: pointer;
          }
          
          .payment-info:hover {
            color: #4f46e5;
          }
          
          .payment-info-icon {
            font-size: 1.2rem;
          }
          
          .security-features {
            display: flex;
            flex-direction: column;
            gap: 15px;
          }
          
          .security-feature {
            display: flex;
            align-items: center;
            text-align: left;
            margin-bottom: 10px;
          }
          
          .security-feature-icon {
            background: linear-gradient(135deg, #4f46e5, #7e22ce);
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            font-size: 1.2rem;
          }
          
          .security-feature-text {
            flex: 1;
          }
          
          .security-feature-title {
            font-weight: 600;
            margin-bottom: 5px;
            color: #1f2937;
          }
          
          .security-feature-description {
            font-size: 0.85rem;
            color: #4b5563;
          }
          
          .back-to-payment {
            margin-top: 20px;
            color: #4f46e5;
            cursor: pointer;
            font-weight: 600;
            display: inline-block;
            position: relative;
          }
          
          .back-to-payment::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 2px;
            bottom: -2px;
            left: 0;
            background: linear-gradient(90deg, #4f46e5, #7e22ce);
            transform: scaleX(0);
            transform-origin: bottom right;
            transition: transform 0.3s ease;
          }
          
          .back-to-payment:hover::after {
            transform: scaleX(1);
            transform-origin: bottom left;
          }
          
          .payment-badges {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin-top: 20px;
          }
          
          .payment-badge {
            background: rgba(255, 255, 255, 0.9);
            color: #4b5563;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 0.8rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 5px;
          }
          
          .payment-badge-icon {
            font-size: 1rem;
          }
          
          @keyframes shine {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
          
          @keyframes float {
            0% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
            100% {
              transform: translateY(0);
            }
          }
          
          .loader {
            width: 48px;
            height: 48px;
            border: 5px solid #FFF;
            border-bottom-color: #4f46e5;
            border-radius: 50%;
            display: inline-block;
            box-sizing: border-box;
            animation: rotation 1s linear infinite;
            margin: 20px 0;
          }
          
          @keyframes rotation {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
          
          .payment-status {
            padding: 10px 20px;
            border-radius: 30px;
            font-weight: 600;
            animation: fadeIn 0.5s ease;
            margin: 15px 0;
          }
          
          .payment-status.success {
            background-color: rgba(16, 185, 129, 0.2);
            color: #10b981;
            border: 1px solid #10b981;
          }
          
          .payment-status.error {
            background-color: rgba(239, 68, 68, 0.2);
            color: #ef4444;
            border: 1px solid #ef4444;
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .pulse {
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
            100% {
              transform: scale(1);
            }
          }
          
          .card-shine {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(
              135deg,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0.1) 50%,
              rgba(255, 255, 255, 0) 100%
            );
            z-index: 1;
            transform: translateY(100%);
            animation: shine-effect 3s infinite;
          }
          
          @keyframes shine-effect {
            0% {
              transform: translateY(100%) rotate(10deg);
            }
            100% {
              transform: translateY(-100%) rotate(10deg);
            }
          }
          
          /* Responsive adjustments */
          @media (max-width: 768px) {
            .payment-card {
              max-width: 320px;
            }
            
            .payment-title {
              font-size: 1.3rem;
            }
            
            .payment-amount {
              font-size: 2rem;
            }
          }
        `}
      </style>

      <div className="payment-card">
        <div className="payment-card-inner">
          <div className="payment-card-front">
            <div className="card-shine"></div>
            <div className="payment-logo">
              <h1>PayEase</h1>
            </div>
            <h2 className="payment-title">Complete Your Payment</h2>
            <div className="payment-amount">₹1.00</div>
            
            {isLoading ? (
              <span className="loader"></span>
            ) : (
              <button 
                className={`payment-button ${paymentStatus === null ? 'pulse' : ''}`} 
                onClick={handlePayment} 
                disabled={isLoading}
              >
                Pay Securely
              </button>
            )}
            
            {paymentStatus === "success" && (
              <div className="payment-status success">
                Payment Successful ✓
              </div>
            )}
            
            {paymentStatus === "error" && (
              <div className="payment-status error">
                Payment Failed ✗
              </div>
            )}
            
            <div className="payment-info" onClick={() => setIsFlipped(true)}>
              <span className="payment-info-icon">ⓘ</span>
              <span>Payment Security Info</span>
            </div>
            
            <div className="payment-badges">
              <div className="payment-badge">
                <span className="payment-badge-icon">🔒</span>
                <span>SSL Secured</span>
              </div>
              <div className="payment-badge">
                <span className="payment-badge-icon">✓</span>
                <span>Verified</span>
              </div>
            </div>
          </div>
          
          <div className="payment-card-back">
            <h2 className="payment-title">Payment Security</h2>
            <div className="security-features">
              <div className="security-feature">
                <div className="security-feature-icon">🔒</div>
                <div className="security-feature-text">
                  <div className="security-feature-title">End-to-End Encryption</div>
                  <div className="security-feature-description">Your payment information is fully encrypted and secure</div>
                </div>
              </div>
              
              <div className="security-feature">
                <div className="security-feature-icon">🛡️</div>
                <div className="security-feature-text">
                  <div className="security-feature-title">PCI DSS Compliant</div>
                  <div className="security-feature-description">We follow the highest security standards</div>
                </div>
              </div>
              
              <div className="security-feature">
                <div className="security-feature-icon">👁️</div>
                <div className="security-feature-text">
                  <div className="security-feature-title">Fraud Detection</div>
                  <div className="security-feature-description">Advanced systems to prevent unauthorized transactions</div>
                </div>
              </div>
            </div>
            
            <div className="back-to-payment" onClick={() => setIsFlipped(false)}>
              Back to Payment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
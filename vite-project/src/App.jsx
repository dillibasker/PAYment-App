import { useState } from 'react'
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './components/checkOutForm';

const stripePromise=loadStripe("pk_test_51R9TMvRh2qqw6gErN1FSncAYovoOco241mpyuwcO9dk04RmO0G0cuewA5qOAZO9PeofDDiyYtFcTgTzA8Wk4saRi00OiJyfHEy")

function App() {

  return (
    <>
      <Elements stripe={stripePromise}>
        <div  className="flex justify-center items-center min-h-screen">
          <CheckoutForm/>
        </div>

      </Elements>
      
    </>
  )
}

export default App

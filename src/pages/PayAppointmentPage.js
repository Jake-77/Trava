import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAppointmentById, getServiceById, saveAppointment } from '../lib/storage';

export default function PayAppointmentPage() {
  const { id: appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const foundAppointment = await getAppointmentById(appointmentId);
        
        if (!foundAppointment) {
          setLoading(false);
          return;
        }
        setAppointment(foundAppointment);
        
        const foundService = await getServiceById(foundAppointment.serviceId);
        setService(foundService);
      } catch (error) {
        console.error("Error fetching payment details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [appointmentId]);

  const handleCashPayment = async () => {
    if (!appointment) return;
    
    const updated = {
      ...appointment,
      paymentStatus: 'paid',
      paymentMethod: 'cash',
    };

    try {
      await saveAppointment(updated);
      setAppointment(updated);
      alert('Payment marked as cash. Thank you!');
    } catch (error) {
      console.error("Failed to process cash payment:", error);
      alert('Error saving payment status.');
    }
  };

  const handlePayPalPayment = async () => {
    if (!appointment || !service) return;

    // 1. Check if the provider has a PayPal handle
    if (!appointment.paypal_handle) {
      alert("This service provider has not set up PayPal details yet.");
      return;
    }
    // 2. Generate the URL
    // Format: paypal.me/HANDLE/PRICE
    const url = `https://paypal.me/${appointment.paypal_handle}/${service.price}`;

    // 3. Open PayPal in a new tab
    window.open(url, '_blank');

    // 4. Verify payment with the user (since PayPal doesn't auto-notify us in this simple version)
    const confirmed = window.confirm(
      "A new tab has opened for PayPal.\n\nAfter you complete the payment, click OK to mark this appointment as Paid."
    );

    if (confirmed) {
      const updated = {
        ...appointment,
        paymentStatus: 'paid',
        paymentMethod: 'paypal',
      };

      try {
        await saveAppointment(updated);
        setAppointment(updated);
      } catch (error) {
        console.error("Failed to save PayPal status:", error);
        alert('Error saving payment status.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!appointment || !service) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">Appointment not found</p>
        </div>
      </div>
    );
  }

  if (appointment.paymentStatus === 'paid') {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Payment Confirmed
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Your payment has been received. Thank you!
              </p>
            </div>
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Payment Method</p>
              <p className="font-medium text-zinc-900 dark:text-zinc-100 capitalize">
                {appointment.paymentMethod}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              {service.title}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Service Description
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap mb-4">
              {service.description}
            </p>
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Price</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {service.price}
              </p>
            </div>
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Payment Options
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleCashPayment}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>💵</span>
                Pay in Cash
              </button>
              <button
                onClick={handlePayPalPayment}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>💳</span>
                Pay with PayPal
              </button>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mt-4">
              Select your preferred payment method
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

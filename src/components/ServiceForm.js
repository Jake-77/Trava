/**
 * ServiceForm - Create/Edit Service Form
 *
 * Purpose:
 * Form component for creating new services or editing existing ones.
 * Works in both create and edit modes based on whether a serviceId is provided.
 *
 * Features:
 * - Service title/type input
 * - Description textarea
 * - Price input (flexible format: $75/service, $50/hour, etc.)
 * - Pre-fills data when editing existing service
 * - Loading state during save operation
 *
 * Data Flow:
 * - Validates user authentication before saving
 * - Associates service with logged-in user
 * - Redirects to services list after successful save
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { saveService, getServiceById } from '../lib/storage';
import { apiGetCurrentUser } from '../lib/storage';

export default function ServiceForm({ serviceId: propServiceId }) {
  const navigate = useNavigate();
  const params = useParams();
  const serviceId = propServiceId || params.id;
  const [existingService, setExistingService] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!serviceId) return;
    const loadService = async () => {
      try {
        const service = await getServiceById(serviceId);
        if (service) {
          setExistingService(service);
          setTitle(service.title || '');
          setDescription(service.description || '');
          setPrice(service.price || '');
        }
      } catch (error) {
        console.error('Error loading service:', error);
      }
    };
    loadService();
  }, [serviceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await apiGetCurrentUser();
      if (!user?.user?.id) {
        navigate('/');
        return;
      }

      const service = {
        ...(existingService || {}),
        user_id: user.user.id,
        title,
        description,
        price,
      };

      await saveService(service);
      navigate('/services');
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Failed to save service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-zinc-900">
          {existingService ? 'Edit Service' : 'Add New Service'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2 text-zinc-900">
              Service Type
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
              placeholder="e.g., Car Detailing, Chimney Sweep"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2 text-zinc-900">
              Service Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
              placeholder="Describe the service you provide..."
            />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-2 text-zinc-900">
              Price
            </label>
            <input
              id="price"
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
              placeholder="e.g., $75/service, $50/hour, $150"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#1E3A74] hover:bg-[#162B57] text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Saving...' : existingService ? 'Update' : 'Add'} Service
            </button>
            <button
              type="button"
              onClick={() => navigate('/services')}
              className="flex-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-900 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

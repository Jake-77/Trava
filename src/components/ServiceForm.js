import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { saveService, getServiceById } from '../lib/storage';
import { getCurrentUser } from '../lib/storage';

export default function ServiceForm({ serviceId: propServiceId }) {
  const navigate = useNavigate();
  const params = useParams();
  const serviceId = propServiceId || params.id;
  const existingService = serviceId ? getServiceById(serviceId) : null;
  const [title, setTitle] = useState(existingService?.title || '');
  const [description, setDescription] = useState(existingService?.description || '');
  const [price, setPrice] = useState(existingService?.price || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) {
      navigate('/');
      return;
    }

    const service = {
      id: existingService?.id || Date.now().toString(),
      userId: user.id,
      title,
      description,
      price,
      createdAt: existingService?.createdAt || new Date().toISOString(),
    };

    saveService(service);
    navigate('/services');
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">
          {existingService ? 'Edit Service' : 'Add New Service'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Service Type
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
              placeholder="e.g., Car Detailing, Chimney Sweep"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Service Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
              placeholder="Describe the service you provide..."
            />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-2">
              Price
            </label>
            <input
              id="price"
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
              placeholder="e.g., $75/service, $50/hour, $150"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {existingService ? 'Update' : 'Add'} Service
            </button>
            <button
              type="button"
              onClick={() => navigate('/services')}
              className="flex-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

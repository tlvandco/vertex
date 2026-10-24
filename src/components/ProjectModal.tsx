import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Project, ProjectStatus } from '../types';
import { MapPin, X, Sparkles, Loader2, DollarSign } from 'lucide-react';

export const ProjectModal: React.FC = () => {
  const {
    isCreateProjectOpen,
    setIsCreateProjectOpen,
    editingProjectData,
    setEditingProjectData,
    addProject,
    updateProject,
    clients,
    addToast
  } = useApp();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [budget, setBudget] = useState(500000);
  const [status, setStatus] = useState<ProjectStatus>('PLANNING');
  const [progress, setProgress] = useState(0);
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    if (editingProjectData) {
      setName(editingProjectData.name);
      setLocation(editingProjectData.location);
      setLatitude(editingProjectData.latitude);
      setLongitude(editingProjectData.longitude);
      setBudget(editingProjectData.budget);
      setStatus(editingProjectData.status);
      setProgress(editingProjectData.progress);
      setDescription(editingProjectData.description);
      setClientId(editingProjectData.clientId);
      setStartDate(editingProjectData.startDate);
      setEndDate(editingProjectData.endDate);
      setCoverImage(editingProjectData.coverImage || '');
    } else {
      setName('');
      setLocation('Beverly Hills, CA');
      setLatitude(34.0736);
      setLongitude(-118.4004);
      setBudget(750000);
      setStatus('PLANNING');
      setProgress(0);
      setDescription('');
      setClientId(clients[0]?.id || 'u4');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate(new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0]);
      setCoverImage('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80');
    }
  }, [editingProjectData, isCreateProjectOpen, clients]);

  if (!isCreateProjectOpen) return null;

  const handleFetchGPS = () => {
    if (!navigator.geolocation) {
      addToast('error', 'Geolocation not supported by this browser');
      return;
    }

    setIsGettingLocation(true);
    addToast('info', 'Accessing GPS hardware coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);
        setLocation(`GPS: ${lat}, ${lng} (Current Coordinates)`);
        setIsGettingLocation(false);
        addToast('success', `GPS acquired: ${lat}, ${lng}`);
      },
      (err) => {
        setIsGettingLocation(false);
        addToast('error', `Location error: ${err.message || 'Permission denied'}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('error', 'Project name is required');
      return;
    }

    const selectedClient = clients.find(c => c.id === clientId) || clients[0];

    if (editingProjectData && editingProjectData.id) {
      updateProject(editingProjectData.id, {
        name,
        location,
        latitude,
        longitude,
        budget: Number(budget),
        status,
        progress: Number(progress),
        description,
        clientId: selectedClient?.id || 'c1',
        clientName: selectedClient?.name || 'Client',
        clientEmail: selectedClient?.email || 'client@example.com',
        startDate,
        endDate,
        coverImage
      });
    } else {
      addProject({
        name,
        location,
        latitude,
        longitude,
        budget: Number(budget),
        status,
        progress: Number(progress),
        description,
        clientId: selectedClient?.id || 'c1',
        clientName: selectedClient?.name || 'Client',
        clientEmail: selectedClient?.email || 'client@example.com',
        startDate,
        endDate,
        coverImage
      });
    }

    setIsCreateProjectOpen(false);
    setEditingProjectData(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative my-8 border border-amber-100 animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-serif font-bold text-[#2C2416]">
              {editingProjectData ? 'Edit Architectural Project' : 'Initiate New Project'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Define project parameters, budget threshold, and client assignment.</p>
          </div>
          <button
            onClick={() => {
              setIsCreateProjectOpen(false);
              setEditingProjectData(null);
            }}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Project Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Villa Aurelia Penthouse"
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Location & GPS</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Address or GPS"
                  className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={handleFetchGPS}
                  disabled={isGettingLocation}
                  className="absolute right-2 p-1.5 text-gray-400 hover:text-[#D4AF37] transition-colors"
                  title="Capture current GPS location"
                >
                  {isGettingLocation ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Total Budget ($ USD)</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-gray-400 text-xs">$</span>
                <input
                  type="number"
                  value={budget}
                  onChange={e => setBudget(Number(e.target.value))}
                  min={1000}
                  step={5000}
                  className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Lifecycle Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none bg-white"
              >
                <option value="PLANNING">Planning</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Assign Client</label>
              <select
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none bg-white"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.company})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Completion Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Scope & Architectural Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Outline interior transformation scope, square footage, materials..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-700">Project Completion: <span className="text-[#B8860B] font-bold">{progress}%</span></label>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={e => setProgress(Number(e.target.value))}
              className="w-full accent-[#D4AF37] h-2 bg-gray-200 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Cover Image URL</label>
            <input
              type="url"
              value={coverImage}
              onChange={e => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setIsCreateProjectOpen(false);
                setEditingProjectData(null);
              }}
              className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#D4AF37] hover:bg-[#B8860B] text-white shadow-md transition-all hover:shadow"
            >
              {editingProjectData ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskProgressImage, UserRole } from '../types';
import {
  Camera,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Trash2,
  Sparkles,
  ShieldCheck,
  MapPin,
  Calendar,
  Layers,
  X,
  Plus,
  Star,
  Award,
  ChevronRight,
  Maximize2,
  FileCheck,
  Check,
  Send
} from 'lucide-react';

interface TaskProgressGalleryProps {
  task: Task;
  compact?: boolean;
}

const PRESET_SITE_PHOTOS = [
  {
    title: 'Slab Rebar & Load Test',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=1200&auto=format&fit=crop&q=80',
    stage: 'Structural Load Verification',
    location: 'Master Suite Subfloor Grid-B2',
    caption: 'Laser leveling and rebar grid inspection complete for heavy stone load.'
  },
  {
    title: 'Italian Marble Dry Lay',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    stage: 'Quarry Dry-Lay & Mirror Matching',
    location: 'Quarry Lot 481 / Salon Fireplace',
    caption: 'Bookmatched continuous vein alignment verified across 4 slabs.'
  },
  {
    title: 'Smart Automation Keypad',
    url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&auto=format&fit=crop&q=80',
    stage: 'Hardware Prototype Sign-Off',
    location: 'Gallery Entrance Keypad Station',
    caption: 'Custom engraved backlit satin nickel keypad prototype tested.'
  },
  {
    title: 'Acoustic White Oak Baffles',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
    stage: 'Acoustic Millwork Mockup',
    location: 'Executive Boardroom Ceiling',
    caption: 'Micro-perforated acoustic oak panels with fire-retardant finish.'
  },
  {
    title: 'Structural Steel Glazing',
    url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&auto=format&fit=crop&q=80',
    stage: 'Terrace Enclosure Frame',
    location: 'Sunset Panoramic Terrace',
    caption: 'Electrochromic smart glass steel mullions anchor test verified.'
  },
  {
    title: 'Vanity Plumbing Rough-in',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&auto=format&fit=crop&q=80',
    stage: 'MEP Pressure Testing',
    location: 'Primary Bath Vanity Wall',
    caption: 'Concealed thermostatic brass valves pressure tested at 80 PSI.'
  }
];

export const TaskProgressGallery: React.FC<TaskProgressGalleryProps> = ({ task, compact = false }) => {
  const {
    currentUser,
    addTaskProgressImage,
    validateTaskProgressImage,
    deleteTaskProgressImage,
    addToast
  } = useApp();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<TaskProgressImage | null>(null);
  const [validationModalImage, setValidationModalImage] = useState<TaskProgressImage | null>(null);

  // Upload Form State
  const [imageSource, setImageSource] = useState<'upload' | 'preset'>('upload');
  const [previewUrl, setPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [stageName, setStageName] = useState(task.stage || 'Field Verification');
  const [locationTag, setLocationTag] = useState('');
  const [progressPercent, setProgressPercent] = useState(task.progressPercent || 75);
  const [customTags, setCustomTags] = useState('Site Inspection');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation Form State
  const [clientFeedback, setClientFeedback] = useState('');
  const [clientRating, setClientRating] = useState(5);
  const [validationDecision, setValidationDecision] = useState<'CLIENT_VALIDATED' | 'REQUIRES_REVISION'>('CLIENT_VALIDATED');

  const images = task.progressImages || [];
  const isClient = currentUser.role === 'CLIENT';
  const isSiteEngineer = currentUser.role === 'SITE_ENGINEER';
  const canUpload =
    currentUser.role === 'SITE_ENGINEER' ||
    currentUser.role === 'PROJECT_MANAGER' ||
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'DESIGNER' ||
    task.assignedToId === currentUser.id;

  const validatedCount = images.filter(img => img.validationStatus === 'CLIENT_VALIDATED').length;
  const pendingCount = images.filter(img => img.validationStatus === 'PENDING_CLIENT_VALIDATION').length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      addToast('error', 'File size exceeds 10MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: typeof PRESET_SITE_PHOTOS[0]) => {
    setPreviewUrl(preset.url);
    setCaption(preset.caption);
    setStageName(preset.stage);
    setLocationTag(preset.location);
  };

  const handleSubmitUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) {
      addToast('error', 'Please select or upload a site progress image');
      return;
    }

    addTaskProgressImage(task.id, {
      imageUrl: previewUrl,
      thumbnailUrl: previewUrl,
      caption: caption || 'Site progress photo for task verification',
      stageName: stageName || task.stage || 'Field Verification',
      locationTag: locationTag || 'Active Work Zone',
      progressPercent,
      tags: customTags.split(',').map(t => t.trim()).filter(Boolean)
    });

    // Reset
    setIsUploadOpen(false);
    setPreviewUrl('');
    setCaption('');
    setLocationTag('');
  };

  const handleConfirmValidation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validationModalImage) return;

    validateTaskProgressImage(task.id, validationModalImage.id, {
      status: validationDecision,
      feedback: clientFeedback,
      rating: clientRating
    });

    setValidationModalImage(null);
    setClientFeedback('');
  };

  return (
    <div className="space-y-3 pt-2">
      {/* Header with Stats & Upload CTA */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
            <Camera className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Site Progress Photos ({images.length})</span>
          </div>

          {images.length > 0 && (
            <div className="flex items-center gap-1 text-[10px]">
              {validatedCount > 0 && (
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200/60 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>{validatedCount} Verified</span>
                </span>
              )}
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-bold rounded-full border border-amber-200/60 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{pendingCount} Pending Sign-Off</span>
                </span>
              )}
            </div>
          )}
        </div>

        {canUpload && (
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="px-2.5 py-1 text-xs font-semibold bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#8B7355] hover:text-[#2C2416] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3 h-3" />
            <span>
              {isSiteEngineer ? 'Upload Site Photo' : 'Add Progress Photo'}
            </span>
          </button>
        )}
      </div>

      {/* Client Quick Callout Banner if pending reviews */}
      {isClient && pendingCount > 0 && (
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Site engineer submitted <strong>{pendingCount} progress photo(s)</strong> awaiting your inspection & sign-off.
            </span>
          </div>
          <span className="text-[11px] font-bold text-amber-700 underline">Review below</span>
        </div>
      )}

      {/* Gallery Grid */}
      {images.length === 0 ? (
        <div className="p-4 bg-gray-50/80 rounded-xl border border-dashed border-gray-200 text-center space-y-1">
          <p className="text-xs text-gray-400">No site progress photos uploaded yet.</p>
          {canUpload && (
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="text-xs text-[#8B7355] font-semibold hover:underline cursor-pointer"
            >
              + Upload first site inspection snapshot
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {images.map(img => {
            const isValidated = img.validationStatus === 'CLIENT_VALIDATED';
            const isPending = img.validationStatus === 'PENDING_CLIENT_VALIDATION';
            const isRevision = img.validationStatus === 'REQUIRES_REVISION';

            return (
              <div
                key={img.id}
                className="bg-white rounded-xl border border-gray-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group relative"
              >
                {/* Photo Thumbnail with Zoom & Badges */}
                <div
                  onClick={() => setSelectedImage(img)}
                  className="relative h-36 bg-gray-900 cursor-pointer overflow-hidden"
                >
                  <img
                    src={img.imageUrl}
                    alt={img.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

                  {/* Validation Badge */}
                  <div className="absolute top-2 left-2">
                    {isValidated ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500 text-white shadow-xs flex items-center gap-1">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        <span>Client Verified</span>
                      </span>
                    ) : isPending ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-white shadow-xs flex items-center gap-1 animate-pulse">
                        <Clock className="w-2.5 h-2.5" />
                        <span>Awaiting Sign-Off</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500 text-white shadow-xs flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>Revision Requested</span>
                      </span>
                    )}
                  </div>

                  {/* Progress % Tag */}
                  {img.progressPercent !== undefined && (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-[#D4AF37] border border-[#D4AF37]/30">
                      {img.progressPercent}% Complete
                    </div>
                  )}

                  {/* Hover Inspect Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <span className="p-2 bg-white/90 text-gray-900 rounded-full shadow-lg text-xs font-semibold flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Inspect Photo</span>
                    </span>
                  </div>

                  {/* Location Overlay */}
                  {img.locationTag && (
                    <div className="absolute bottom-2 left-2 right-2 text-white text-[11px] font-medium truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#D4AF37] shrink-0" />
                      <span className="truncate">{img.locationTag}</span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span className="font-semibold text-gray-800 truncate">{img.stageName || 'Field Inspection'}</span>
                      <span className="shrink-0">{img.uploadedAt.split(' ')[0]}</span>
                    </div>

                    <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                      {img.caption}
                    </p>
                  </div>

                  {/* Uploader Role & Company Badge */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      {img.uploadedBy.avatar && (
                        <img
                          src={img.uploadedBy.avatar}
                          alt={img.uploadedBy.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <span className="font-bold text-gray-800 block text-[10px]">{img.uploadedBy.name}</span>
                        <span className="text-[9px] text-[#8B7355] uppercase font-semibold">
                          {img.uploadedBy.role.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Delete button (Author or Admin) */}
                    {(currentUser.role === 'ADMIN' || currentUser.id === img.uploadedBy.id) && (
                      <button
                        type="button"
                        onClick={() => deleteTaskProgressImage(task.id, img.id)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Client Validation Box / Action */}
                  {isValidated && img.clientValidation && (
                    <div className="p-2 bg-emerald-50/80 rounded-lg border border-emerald-200/60 text-[10px] space-y-1">
                      <div className="flex items-center justify-between text-emerald-900 font-bold">
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-emerald-600" />
                          <span>Signed: {img.clientValidation.validatedBy}</span>
                        </span>
                        <span className="font-mono text-[9px] text-emerald-700 bg-emerald-100 px-1 py-0.5 rounded">
                          {img.clientValidation.signatureVerificationCode}
                        </span>
                      </div>
                      {img.clientValidation.feedback && (
                        <p className="text-emerald-800 italic">"{img.clientValidation.feedback}"</p>
                      )}
                    </div>
                  )}

                  {/* Client Review Button (Available for Client or Admin testing) */}
                  {(isClient || currentUser.role === 'ADMIN') && !isValidated && (
                    <button
                      type="button"
                      onClick={() => {
                        setValidationModalImage(img);
                        setValidationDecision('CLIENT_VALIDATED');
                        setClientFeedback('');
                      }}
                      className="w-full py-1.5 px-3 bg-[#2C2416] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#2C2416] font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{isClient ? 'Validate & Sign Off Work' : 'Review as Client'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: UPLOAD SITE PROGRESS PHOTO */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-gray-900">Upload Site Progress Photo</h3>
                <p className="text-xs text-gray-500">
                  Uploading as <strong>{currentUser.name}</strong> ({currentUser.role.replace('_', ' ')})
                </p>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Source Switcher */}
            <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setImageSource('upload')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  imageSource === 'upload' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload From Device / Camera</span>
              </button>
              <button
                type="button"
                onClick={() => setImageSource('preset')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  imageSource === 'preset' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Preset Site Inspections</span>
              </button>
            </div>

            <form onSubmit={handleSubmitUpload} className="space-y-4">
              {/* Device Upload Zone */}
              {imageSource === 'upload' && (
                <div className="space-y-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-[#D4AF37] rounded-xl p-6 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-amber-50/30"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    {previewUrl ? (
                      <div className="space-y-2">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded-lg object-cover shadow-sm"
                        />
                        <p className="text-xs text-[#8B7355] font-semibold">Click to change selected image</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-10 h-10 bg-amber-50 text-[#8B7355] rounded-full flex items-center justify-center mx-auto">
                          <Camera className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">Click to upload or take a photo</p>
                          <p className="text-[11px] text-gray-400">Supports JPG, PNG, WEBP up to 10MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Preset Gallery Selector */}
              {imageSource === 'preset' && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-700">Choose a site inspection snapshot:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRESET_SITE_PHOTOS.map((preset, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                          previewUrl === preset.url
                            ? 'border-[#D4AF37] bg-amber-50/60 ring-2 ring-[#D4AF37]/30'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.title}
                          className="w-full h-20 object-cover rounded-lg mb-1.5"
                        />
                        <span className="text-[11px] font-bold text-gray-800 block truncate">{preset.title}</span>
                        <span className="text-[9px] text-gray-500 block truncate">{preset.location}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Stage / Milestone Description</label>
                  <input
                    type="text"
                    value={stageName}
                    onChange={e => setStageName(e.target.value)}
                    placeholder="e.g. Subfloor Reinforcement"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Location Tag / Room Coordinate</label>
                  <input
                    type="text"
                    value={locationTag}
                    onChange={e => setLocationTag(e.target.value)}
                    placeholder="e.g. Penthouse Master Suite Grid-B2"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-semibold text-xs mb-1">Field Caption & Technical Details</label>
                <textarea
                  rows={2}
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Detail the engineering inspection, measurements, materials verified, and test outcomes..."
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              {/* Progress Slider */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Physical Completion Reported:</span>
                  <span className="font-bold text-[#8B7355]">{progressPercent}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={progressPercent}
                  onChange={e => setProgressPercent(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] h-2 bg-gray-200 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D4AF37] hover:bg-[#B8860B] text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Submit For Client Validation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CLIENT VALIDATION & DIGITAL SEAL MODAL */}
      {validationModalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                  <span>Client Validation & Verification</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Reviewing progress proof submitted by {validationModalImage.uploadedBy.name} ({validationModalImage.uploadedBy.role.replace('_', ' ')})
                </p>
              </div>
              <button
                onClick={() => setValidationModalImage(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thumbnail Preview with Caption */}
            <div className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200/80">
              <img
                src={validationModalImage.imageUrl}
                alt="Validation"
                className="w-24 h-20 object-cover rounded-lg shrink-0"
              />
              <div className="text-xs space-y-1 min-w-0">
                <span className="font-bold text-gray-900 block truncate">{validationModalImage.stageName}</span>
                <span className="text-[11px] text-gray-500 block truncate">{validationModalImage.locationTag}</span>
                <p className="text-gray-700 line-clamp-2 text-[11px]">{validationModalImage.caption}</p>
              </div>
            </div>

            <form onSubmit={handleConfirmValidation} className="space-y-4">
              {/* Decision Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Validation Decision</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setValidationDecision('CLIENT_VALIDATED')}
                    className={`p-3 rounded-xl border text-center font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      validationDecision === 'CLIENT_VALIDATED'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Approve & Sign Off Work</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValidationDecision('REQUIRES_REVISION')}
                    className={`p-3 rounded-xl border text-center font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      validationDecision === 'REQUIRES_REVISION'
                        ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Request Revision / Note</span>
                  </button>
                </div>
              </div>

              {/* Star Rating if Approved */}
              {validationDecision === 'CLIENT_VALIDATED' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Execution Quality Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setClientRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star className={`w-5 h-5 ${star <= clientRating ? 'fill-amber-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-gray-700 ml-2">{clientRating} / 5 Stars</span>
                  </div>
                </div>
              )}

              {/* Feedback Note */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Client Verification Notes / Remarks (Optional)
                </label>
                <textarea
                  rows={2}
                  value={clientFeedback}
                  onChange={e => setClientFeedback(e.target.value)}
                  placeholder={
                    validationDecision === 'CLIENT_VALIDATED'
                      ? 'e.g. Work confirmed and approved according to architectural drawing specifications.'
                      : 'e.g. Please take an additional close-up photo of the brass fitting joint.'
                  }
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              {/* Digital Certificate Preview */}
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 text-[11px] text-amber-900 space-y-1">
                <span className="font-bold block">🔒 Cryptographic Audit Seal</span>
                <p className="text-[10px] text-amber-800">
                  This action generates a verified client digital certificate stamped with current timestamp, client user token ({currentUser.name}), and records an immutable entry into the audit trail.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setValidationModalImage(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                    validationDecision === 'CLIENT_VALIDATED'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>
                    {validationDecision === 'CLIENT_VALIDATED'
                      ? 'Generate Seal & Sign Off'
                      : 'Submit Revision Request'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: FULLSCREEN HIGH-RES LIGHTBOX INSPECTOR */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row">
            {/* Left Image View */}
            <div className="flex-1 bg-black flex items-center justify-center relative min-h-[300px] md:min-h-[480px]">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.caption}
                className="max-h-[85vh] w-auto object-contain mx-auto"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="md:hidden absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Right Sidebar Information */}
            <div className="w-full md:w-80 bg-white p-5 flex flex-col justify-between overflow-y-auto space-y-4 border-l border-gray-100">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-[#8B7355] uppercase tracking-wider block">
                      Site Progress Log
                    </span>
                    <h4 className="font-serif font-bold text-gray-900 text-base">{selectedImage.stageName}</h4>
                  </div>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="hidden md:block p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Validation Status Badge */}
                <div>
                  {selectedImage.validationStatus === 'CLIENT_VALIDATED' ? (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span>Client Verified & Sealed</span>
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        Signed by <strong>{selectedImage.clientValidation?.validatedBy}</strong> on {selectedImage.clientValidation?.validatedAt}
                      </p>
                      <div className="font-mono text-[10px] text-emerald-700 bg-white/70 px-2 py-0.5 rounded inline-block font-semibold">
                        Seal: {selectedImage.clientValidation?.signatureVerificationCode}
                      </div>
                      {selectedImage.clientValidation?.feedback && (
                        <p className="text-[11px] text-emerald-800 italic pt-1 border-t border-emerald-200/50">
                          "{selectedImage.clientValidation.feedback}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Pending Client Sign-Off</span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        Awaiting review from estate client or authorized representative.
                      </p>
                    </div>
                  )}
                </div>

                {/* Technical Caption */}
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Inspection Summary</span>
                  <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-2.5 rounded-xl">
                    {selectedImage.caption}
                  </p>
                </div>

                {/* Metadata Details */}
                <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location:</span>
                    <span className="font-semibold text-gray-800">{selectedImage.locationTag}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Uploaded By:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedImage.uploadedBy.name} ({selectedImage.uploadedBy.role.replace('_', ' ')})
                    </span>
                  </div>

                  {selectedImage.uploadedBy.company && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Trade Partner:</span>
                      <span className="font-semibold text-gray-800">{selectedImage.uploadedBy.company}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-400">Captured:</span>
                    <span className="font-semibold text-gray-800">{selectedImage.uploadedAt}</span>
                  </div>

                  {selectedImage.cameraMetadata && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-400">Sensor / Scanner:</span>
                      <span className="font-mono text-gray-600">{selectedImage.cameraMetadata.device}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Client Action CTA */}
              {(isClient || currentUser.role === 'ADMIN') && selectedImage.validationStatus !== 'CLIENT_VALIDATED' && (
                <button
                  onClick={() => {
                    const img = selectedImage;
                    setSelectedImage(null);
                    setValidationModalImage(img);
                    setValidationDecision('CLIENT_VALIDATED');
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Validate & Sign Off This Work</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

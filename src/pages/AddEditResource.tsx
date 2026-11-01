import React, { useState } from 'react';
import { ResourceCategory, ResourceItem, ResourceStatus, UserProfile } from '../types';
import {
  ArrowLeft,
  Building,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  ShieldCheck,
  Sparkles,
  Wrench
} from 'lucide-react';

interface AddEditResourceProps {
  resourceToEdit?: ResourceItem | null;
  currentProfile: UserProfile;
  onSave: (resourceData: any) => void;
  onCancel: () => void;
}

export const AddEditResource: React.FC<AddEditResourceProps> = ({
  resourceToEdit,
  currentProfile,
  onSave,
  onCancel
}) => {
  const isEdit = Boolean(resourceToEdit);

  const [title, setTitle] = useState(resourceToEdit?.title || '');
  const [category, setCategory] = useState<ResourceCategory>(
    resourceToEdit?.category || 'Engineering Tools'
  );
  const [description, setDescription] = useState(resourceToEdit?.description || '');
  const [locationLabel, setLocationLabel] = useState(resourceToEdit?.location_label || '');
  const [building, setBuilding] = useState(resourceToEdit?.building || 'Engineering Hall');
  const [room, setRoom] = useState(resourceToEdit?.room || 'Room 101');
  const [imageUrl, setImageUrl] = useState(
    resourceToEdit?.image_url ||
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
  );
  const [maxDurationHours, setMaxDurationHours] = useState(resourceToEdit?.max_duration_hours || 4);
  const [availabilitySchedule, setAvailabilitySchedule] = useState(
    resourceToEdit?.availability_schedule || 'Mon–Fri: 09:00 – 17:00'
  );
  const [supervisionRequired, setSupervisionRequired] = useState(
    resourceToEdit?.supervision_required || false
  );
  const [requiresApproval, setRequiresApproval] = useState(
    resourceToEdit?.requires_approval ?? true
  );
  const [status, setStatus] = useState<ResourceStatus>(resourceToEdit?.status || 'active');
  const [costPerHour, setCostPerHour] = useState<number>(resourceToEdit?.cost_per_hour ?? 0);
  const [costLabel, setCostLabel] = useState<string>(
    resourceToEdit?.cost_label || '$0/hr (Free Student & Faculty Access)'
  );
  const [costBillingModel, setCostBillingModel] = useState<string>(
    resourceToEdit?.cost_billing_model || 'Department Subsidized Facility'
  );

  // Specs & Rules raw text
  const [specsText, setSpecsText] = useState(
    resourceToEdit?.specifications
      ? Object.entries(resourceToEdit.specifications)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n')
      : 'Manufacturer: Precision Labs\nPower: 220V 16A\nResolution: 50 microns'
  );

  const [rulesText, setRulesText] = useState(
    resourceToEdit?.rules?.join('\n') ||
      'Wear approved personal protective equipment\nClean work area after job completion\nDo not bypass safety interlocks'
  );

  const [requiredTrainingsText, setRequiredTrainingsText] = useState(
    resourceToEdit?.eligibility_rules?.required_training?.join(', ') ||
      'Laser Safety Level 2, 3D Sintering Certification'
  );

  const categories: ResourceCategory[] = [
    'Computers and Laptops',
    'Laboratory Equipment',
    'Engineering Tools',
    'Robotics Equipment',
    'Photography and Audio Equipment',
    'Meeting Rooms',
    'Classrooms',
    'Workshops and Makerspaces',
    'Other Shared Resources'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !locationLabel.trim()) {
      alert('Please fill out the title and location.');
      return;
    }

    // Parse specs
    const specifications: Record<string, string> = {};
    specsText.split('\n').forEach(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        specifications[parts[0].trim()] = parts.slice(1).join(':').trim();
      }
    });

    const rules = rulesText
      .split('\n')
      .map(r => r.trim())
      .filter(Boolean);

    const requiredTrainings = requiredTrainingsText
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    onSave({
      id: resourceToEdit?.id,
      title: title.trim(),
      category,
      description: description.trim(),
      location_label: locationLabel.trim(),
      building: building.trim(),
      room: room.trim(),
      image_url: imageUrl.trim(),
      specifications,
      rules,
      eligibility_rules: {
        restricted: requiredTrainings.length > 0,
        required_training: requiredTrainings
      },
      max_duration_hours: Number(maxDurationHours) || 4,
      availability_schedule: availabilitySchedule.trim(),
      supervision_required: supervisionRequired,
      requires_approval: requiresApproval,
      status,
      cost_per_hour: Number(costPerHour) || 0,
      cost_label: costLabel.trim() || (costPerHour ? `$${costPerHour}/hr` : '$0/hr (Free Access)'),
      cost_billing_model: costBillingModel.trim()
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back link */}
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 text-xs font-semibold font-inter text-[#6F4E37] hover:text-[#BF6B2E] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Cancel & Return</span>
      </button>

      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#BF6B2E] font-inter">
          // INVENTORY ONBOARDING
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#34251F] mt-1">
          {isEdit ? 'Edit Resource Listing' : 'Publish Equipment or Space'}
        </h1>
        <p className="text-xs sm:text-sm text-[#50453e] mt-1 font-inter">
          Make underutilized machinery, test benches, or facilities available for scheduled sharing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-xs space-y-6">
        {/* Basic Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#6F4E37] font-inter border-b border-[#D8C3A5] pb-2">
            1. Core Identity & Category
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E37] font-inter mb-1.5">
                Resource Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. 5-Axis CNC Milling Center"
                required
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] text-[#34251F] font-inter"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E37] font-inter mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ResourceCategory)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] text-[#34251F] font-inter"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E37] font-inter mb-1.5">
              Detailed Description *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide an overview of capabilities, materials supported, and suitable research projects..."
              required
              className="w-full p-3 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] font-inter"
            />
          </div>
        </div>

        {/* Location & Image */}
        <div className="space-y-4 pt-4 border-t border-[#D8C3A5]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#6F4E37] font-inter border-b border-[#D8C3A5] pb-2">
            2. Campus Location & Imagery
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E37] font-inter mb-1.5">
                Location Label *
              </label>
              <input
                type="text"
                value={locationLabel}
                onChange={e => setLocationLabel(e.target.value)}
                placeholder="e.g. Maker Wing, Station 3"
                required
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] font-inter"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E37] font-inter mb-1.5">
                Building Name
              </label>
              <input
                type="text"
                value={building}
                onChange={e => setBuilding(e.target.value)}
                placeholder="e.g. Engineering Hall"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] font-inter"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E37] font-inter mb-1.5">
                Room / Bay #
              </label>
              <input
                type="text"
                value={room}
                onChange={e => setRoom(e.target.value)}
                placeholder="e.g. Room 204"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] font-inter"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E37] font-inter mb-1.5">
              Resource Photo URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] font-inter"
            />
          </div>
        </div>

        {/* Specifications & Usage Rules */}
        <div className="space-y-4 pt-4 border-t border-[#D8C3A5]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#6F4E37] font-inter border-b border-[#D8C3A5] pb-2">
            3. Specifications & Safety Protocol
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E37] font-inter mb-1.5">
                Specifications (Key: Value per line)
              </label>
              <textarea
                rows={4}
                value={specsText}
                onChange={e => setSpecsText(e.target.value)}
                className="w-full p-2.5 text-xs font-mono rounded-lg border border-[#D8C3A5] bg-[#FFFAF2]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E37] font-inter mb-1.5">
                Safety & Usage Rules (One per line)
              </label>
              <textarea
                rows={4}
                value={rulesText}
                onChange={e => setRulesText(e.target.value)}
                className="w-full p-2.5 text-xs font-mono rounded-lg border border-[#D8C3A5] bg-[#FFFAF2]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E37] font-inter mb-1.5">
              Required Safety Trainings / Certifications (comma-separated)
            </label>
            <input
              type="text"
              value={requiredTrainingsText}
              onChange={e => setRequiredTrainingsText(e.target.value)}
              placeholder="e.g. Laser Safety Level 2, 3D Sintering Certification"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] font-inter"
            />
          </div>
        </div>

        {/* Scheduling Limits */}
        <div className="space-y-4 pt-4 border-t border-[#D8C3A5]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#6F4E37] font-inter border-b border-[#D8C3A5] pb-2">
            4. Reservation Policies & Limits
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E37] font-inter mb-1.5">
                Max Reservation Duration (Hours)
              </label>
              <input
                type="number"
                min={1}
                max={24}
                value={maxDurationHours}
                onChange={e => setMaxDurationHours(parseInt(e.target.value) || 4)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] font-inter"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E37] font-inter mb-1.5">
                Availability Schedule
              </label>
              <input
                type="text"
                value={availabilitySchedule}
                onChange={e => setAvailabilitySchedule(e.target.value)}
                placeholder="e.g. Mon–Fri: 09:00 – 17:00"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] font-inter"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E37] font-inter mb-1.5">
                Listing Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ResourceStatus)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] font-inter"
              >
                <option value="active">Active (Available for booking)</option>
                <option value="draft">Draft (Private)</option>
                <option value="paused">Paused (Maintenance)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-2 text-xs font-inter text-[#34251F]">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={requiresApproval}
                onChange={e => setRequiresApproval(e.target.checked)}
                className="w-4 h-4 text-[#BF6B2E] rounded border-[#D8C3A5]"
              />
              <span>Require manual owner approval for each reservation</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={supervisionRequired}
                onChange={e => setSupervisionRequired(e.target.checked)}
                className="w-4 h-4 text-[#BF6B2E] rounded border-[#D8C3A5]"
              />
              <span>Staff supervision required during equipment operation</span>
            </label>
          </div>
        </div>

        {/* Cost & Pricing Section */}
        <div className="space-y-4 pt-4 border-t border-[#D8C3A5]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#6F4E37] font-inter border-b border-[#D8C3A5] pb-2">
            5. Cost &amp; Billing Rates (Near Every Listing)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E37] font-inter mb-1.5">
                Hourly Cost ($)
              </label>
              <input
                type="number"
                min={0}
                value={costPerHour}
                onChange={e => {
                  const val = parseInt(e.target.value) || 0;
                  setCostPerHour(val);
                  if (val === 0) {
                    setCostLabel('$0/hr (Free Student & Faculty Access)');
                  } else {
                    setCostLabel(`$${val}/hr (Subsidized Department Rate)`);
                  }
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] font-inter"
              />
              <span className="text-[10px] text-stone-500 font-inter mt-1 block">Set 0 for fully grant-funded free assets</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E37] font-inter mb-1.5">
                Cost Badge Label (Shown on Listing)
              </label>
              <input
                type="text"
                value={costLabel}
                onChange={e => setCostLabel(e.target.value)}
                placeholder="e.g. $25/hr (Lab Consumables)"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] font-inter"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E37] font-inter mb-1.5">
                Billing Model / Funding Source
              </label>
              <input
                type="text"
                value={costBillingModel}
                onChange={e => setCostBillingModel(e.target.value)}
                placeholder="e.g. Subsidized FabLab Material Fee"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] font-inter"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="pt-4 border-t border-[#D8C3A5] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg text-xs font-semibold font-inter text-stone-600 hover:bg-stone-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg text-xs font-semibold font-inter bg-[#BF6B2E] text-white hover:bg-[#a35922] transition-colors shadow-xs"
          >
            {isEdit ? 'Save Changes' : 'Publish Resource Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

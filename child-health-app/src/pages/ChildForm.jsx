import React from 'react';
import { Camera, Save, User, Calendar, Scale, Ruler } from 'lucide-react';

const ChildForm = () => {
  const [formData, setFormData] = React.useState({
    childName: '',
    age: '',
    weight: '',
    height: '',
    parentName: '',
    malnutritionSigns: '',
    recentIllnesses: '',
    parentalConsent: false,
    photo: null,
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, photo: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateHealthId = () => {
    return 'CHR' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.parentalConsent) {
      alert('Parental consent is required to proceed.');
      return;
    }

    setIsSubmitting(true);

    try {
      const healthId = generateHealthId();
      const record = {
        ...formData,
        healthId,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        uploaded: false,
      };

      // Save to local storage
      const existingRecords = JSON.parse(localStorage.getItem('childRecords') || '[]');
      existingRecords.push(record);
      localStorage.setItem('childRecords', JSON.stringify(existingRecords));

      // Trigger storage event for dashboard update
      window.dispatchEvent(new Event('storage'));

      alert(`Child record saved successfully! Health ID: ${healthId}`);
      
      // Reset form
      setFormData({
        childName: '',
        age: '',
        weight: '',
        height: '',
        parentName: '',
        malnutritionSigns: '',
        recentIllnesses: '',
        parentalConsent: false,
        photo: null,
      });

    } catch (error) {
      console.error('Error saving record:', error);
      alert('Error saving record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-6">
          <User className="h-6 w-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">New Child Health Record</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Child Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Child's Name *</label>
              <input
                type="text"
                name="childName"
                value={formData.childName}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Age (years) *</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="form-input"
                min="0"
                max="18"
                required
              />
            </div>
          </div>

          {/* Photo */}
          <div>
            <label className="form-label">Child's Photo</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {formData.photo ? (
                  <img
                    src={formData.photo}
                    alt="Child"
                    className="mx-auto h-32 w-32 object-cover rounded-md"
                  />
                ) : (
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                    <span>Upload or capture photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoCapture}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Physical Measurements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Weight (kg) *</label>
              <div className="relative">
                <Scale className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  step="0.1"
                  min="0"
                  required
                />
              </div>
            </div>
            <div>
              <label className="form-label">Height (cm) *</label>
              <div className="relative">
                <Ruler className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  step="0.1"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div>
            <label className="form-label">Parent/Guardian's Name *</label>
            <input
              type="text"
              name="parentName"
              value={formData.parentName}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          {/* Health Information */}
          <div>
            <label className="form-label">Visible Signs of Malnutrition</label>
            <textarea
              name="malnutritionSigns"
              value={formData.malnutritionSigns}
              onChange={handleInputChange}
              className="form-input"
              rows={3}
              placeholder="Describe any visible signs or enter 'N/A' if none observed"
            />
          </div>

          <div>
            <label className="form-label">Recent Illnesses</label>
            <textarea
              name="recentIllnesses"
              value={formData.recentIllnesses}
              onChange={handleInputChange}
              className="form-input"
              rows={3}
              placeholder="List recent illnesses or enter 'N/A' if none reported"
            />
          </div>

          {/* Consent */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="parentalConsent"
              checked={formData.parentalConsent}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              I confirm that parental/guardian consent has been obtained for collecting this child's health data *
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChildForm;
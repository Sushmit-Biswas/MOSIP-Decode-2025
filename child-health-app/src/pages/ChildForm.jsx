import React from 'react';
import { Camera, Save, User, Calendar, Scale, Ruler, AlertCircle } from 'lucide-react';
import childHealthDB from '../services/indexedDB';
import apiService from '../services/apiService';
import { useNavigate } from 'react-router-dom';

const ChildForm = () => {
  const navigate = useNavigate();
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
  const [validationErrors, setValidationErrors] = React.useState({});

  React.useEffect(() => {
    // Initialize IndexedDB when component mounts
    childHealthDB.init().catch(console.error);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors(prev => ({ 
          ...prev, 
          photo: 'Photo size must be less than 5MB' 
        }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, photo: e.target.result }));
        setValidationErrors(prev => ({ ...prev, photo: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateHealthId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `CHR${timestamp}${randomStr}`;
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.childName.trim()) {
      errors.childName = 'Child name is required';
    }

    if (!formData.age || formData.age < 0 || formData.age > 18) {
      errors.age = 'Valid age (0-18 years) is required';
    }

    if (!formData.weight || formData.weight <= 0) {
      errors.weight = 'Valid weight is required';
    }

    if (!formData.height || formData.height <= 0) {
      errors.height = 'Valid height is required';
    }

    if (!formData.parentName.trim()) {
      errors.parentName = 'Parent/Guardian name is required';
    }

    if (!formData.parentalConsent) {
      errors.parentalConsent = 'Parental consent is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const healthId = generateHealthId();
      const location = await getCurrentLocation();
      
      const record = {
        ...formData,
        healthId,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        representativeId: 'current_user', // This would come from auth context
        location,
        uploaded: false // Will be set to true if successfully saved to server
      };

      // Try to save to server if online
      const isOnline = navigator.onLine;
      let serverSaveSuccess = false;

      if (isOnline) {
        try {
          const response = await apiService.createChild(record);
          if (response.success) {
            record.uploaded = true;
            record.serverId = response.data._id;
            serverSaveSuccess = true;
            console.log('✅ Record saved to server');
          }
        } catch (serverError) {
          console.log('❌ Server save failed, will save locally:', serverError.message);
        }
      }

      // Always save to IndexedDB for offline access
      await childHealthDB.saveChildRecord(record);

      // Show success message with Health ID
      const statusMessage = serverSaveSuccess 
        ? '✅ Child record saved successfully and uploaded to server!'
        : '✅ Child record saved locally! It will sync when internet is available.';
      
      alert(`${statusMessage}\n\nHealth ID: ${healthId}\n\nPlease share this Health ID with the child's family for future reference.`);
      
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

      // Redirect to records list
      navigate('/records');

    } catch (error) {
      console.error('Error saving record:', error);
      alert('❌ Error saving record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
          },
          () => resolve(null),
          { timeout: 5000 }
        );
      } else {
        resolve(null);
      }
    });
  };

  const calculateBMI = () => {
    if (formData.weight && formData.height) {
      const heightInM = formData.height / 100;
      const bmi = (formData.weight / (heightInM * heightInM)).toFixed(1);
      return bmi;
    }
    return null;
  };

  const bmi = calculateBMI();

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
                className={`form-input ${validationErrors.childName ? 'border-red-500' : ''}`}
                required
              />
              {validationErrors.childName && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.childName}
                </p>
              )}
            </div>
            <div>
              <label className="form-label">Age (years) *</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className={`form-input ${validationErrors.age ? 'border-red-500' : ''}`}
                min="0"
                max="18"
                step="0.1"
                required
              />
              {validationErrors.age && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.age}
                </p>
              )}
            </div>
          </div>

          {/* Photo */}
          <div>
            <label className="form-label">Child's Photo</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {formData.photo ? (
                  <div className="space-y-2">
                    <img
                      src={formData.photo}
                      alt="Child"
                      className="mx-auto h-32 w-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, photo: null }))}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove Photo
                    </button>
                  </div>
                ) : (
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                    <span>{formData.photo ? 'Change Photo' : 'Upload or capture photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoCapture}
                      className="sr-only"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
              </div>
            </div>
            {validationErrors.photo && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {validationErrors.photo}
              </p>
            )}
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
                  className={`form-input pl-10 ${validationErrors.weight ? 'border-red-500' : ''}`}
                  step="0.1"
                  min="0"
                  required
                />
              </div>
              {validationErrors.weight && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.weight}
                </p>
              )}
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
                  className={`form-input pl-10 ${validationErrors.height ? 'border-red-500' : ''}`}
                  step="0.1"
                  min="0"
                  required
                />
              </div>
              {validationErrors.height && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.height}
                </p>
              )}
            </div>
          </div>

          {/* BMI Display */}
          {bmi && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Calculated BMI:</strong> {bmi} kg/m²
                {bmi < 18.5 && ' (Underweight)'}
                {bmi >= 18.5 && bmi < 25 && ' (Normal weight)'}
                {bmi >= 25 && bmi < 30 && ' (Overweight)'}
                {bmi >= 30 && ' (Obese)'}
              </p>
            </div>
          )}

          {/* Parent Information */}
          <div>
            <label className="form-label">Parent/Guardian's Name *</label>
            <input
              type="text"
              name="parentName"
              value={formData.parentName}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.parentName ? 'border-red-500' : ''}`}
              required
            />
            {validationErrors.parentName && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {validationErrors.parentName}
              </p>
            )}
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
            <p className="text-xs text-gray-500 mt-1">
              Look for: stunting, wasting, underweight, swelling, hair changes, skin problems
            </p>
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
            <p className="text-xs text-gray-500 mt-1">
              Include: fever, diarrhea, respiratory issues, infections in the last 30 days
            </p>
          </div>

          {/* Consent */}
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex items-start">
              <input
                type="checkbox"
                name="parentalConsent"
                checked={formData.parentalConsent}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <div className="ml-3">
                <label className="block text-sm text-gray-900 font-medium">
                  Parental/Guardian Consent Required *
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  I confirm that parental/guardian consent has been obtained for collecting this child's health data. 
                  The data will be used for health monitoring and nutrition program purposes only.
                </p>
              </div>
            </div>
            {validationErrors.parentalConsent && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {validationErrors.parentalConsent}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/records')}
              className="btn-secondary"
            >
              Cancel
            </button>
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
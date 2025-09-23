import React from 'react';
import { Camera, Save, User, Calendar, Scale, Ruler, AlertCircle, MapPin, CheckCircle, Plus, Minus } from 'lucide-react';
import childHealthDB from '../services/indexedDB';
import apiService from '../services/apiService';
import geolocationService from '../services/geolocationService';
import notificationService from '../services/notificationService';
import activityLogger from '../services/activityLogger';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

const ChildForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const hasInitializedLocation = React.useRef(false);
  
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
  const [locationData, setLocationData] = React.useState(null);
  const [isCapturingLocation, setIsCapturingLocation] = React.useState(false);
  const [locationError, setLocationError] = React.useState(null);

  React.useEffect(() => {
    // Initialize IndexedDB when component mounts
    childHealthDB.init().catch(console.error);
    
    // Log page visit with safety check
    try {
      if (activityLogger && activityLogger.ACTIONS && activityLogger.ACTIONS.PAGE_VISITED) {
        activityLogger.logActivity(activityLogger.ACTIONS.PAGE_VISITED, {
          page: 'Child Form',
          path: '/add-child'
        });
      }
    } catch (error) {
      console.warn('Failed to log page visit:', error);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special handling for age to ensure integer only
    if (name === 'age') {
      // Only allow integer values
      const intValue = parseInt(value) || '';
      if (value !== '' && (isNaN(intValue) || intValue < 0 || intValue > 18)) {
        return; // Don't update if invalid
      }
      setFormData(prev => ({
        ...prev,
        [name]: intValue === '' ? '' : intValue.toString()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

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
        
        // Log photo capture
        if (activityLogger && activityLogger.ACTIONS) {
          activityLogger.logActivity(activityLogger.ACTIONS.PHOTO_CAPTURED, {
            fileSize: file.size,
            fileType: file.type,
            fileName: file.name
          });
        }
      };
      reader.readAsDataURL(file);
    }
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

  const captureLocation = React.useCallback(async (isAutoCapture = false) => {
    // Prevent duplicate location capture requests
    if (isCapturingLocation) {
      return;
    }
    
    setIsCapturingLocation(true);
    setLocationError(null);
    
    try {
      const location = await geolocationService.getLocationWithFallback();
      setLocationData(location);
      
      // Log location capture
      if (activityLogger && activityLogger.ACTIONS) {
        activityLogger.logActivity(activityLogger.ACTIONS.LOCATION_CAPTURED, {
          accuracy: location.accuracy,
          coordinates: location.coordinateString,
          method: isAutoCapture ? 'auto' : 'manual'
        });
      }
      
      // Only show notification for manual captures, not auto-captures
      if (!isAutoCapture) {
        notificationService.locationCaptured(location.accuracy);
      }
    } catch (error) {
      setLocationError(error.message);
      
      // Log location failure
      if (activityLogger && activityLogger.ACTIONS) {
        activityLogger.logActivity(activityLogger.ACTIONS.LOCATION_FAILED, {
          error: error.message,
          method: isAutoCapture ? 'auto' : 'manual'
        });
      }
      
      // Only show notification if we don't already have a location and it's not an auto-capture
      if (!locationData && !isAutoCapture) {
        notificationService.locationFailed();
      }
    } finally {
      setIsCapturingLocation(false);
    }
  }, [isCapturingLocation, locationData]);

  React.useEffect(() => {
    // Auto-capture location when component mounts, but only once
    let isMounted = true;
    
    const initializeLocation = async () => {
      if (isMounted && !hasInitializedLocation.current && !locationData && !isCapturingLocation) {
        hasInitializedLocation.current = true;
        await captureLocation(true); // Pass true to indicate auto-capture
      }
    };
    
    initializeLocation();
    
    return () => {
      isMounted = false;
    };
  }, [locationData, isCapturingLocation, captureLocation]); // Include dependencies but use ref to prevent re-runs

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      notificationService.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    let loadingToast = null;
    
    try {
      loadingToast = notificationService.loading('Saving child record...');
      
      const healthId = `CHR${uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase()}`;
      
      const record = {
        ...formData,
        healthId,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        representativeId: user?.nationalId || 'unknown',
        location: locationData,
        uploaded: false
      };

      // Try to save to server if online
      const isOnline = navigator.onLine;
      let serverSaveSuccess = false;

      if (isOnline) {
        try {
          const response = await apiService.createChild(record);
          if (response && response.success) {
            record.uploaded = true;
            record.serverId = response.data?._id;
            serverSaveSuccess = true;
            console.log('✅ Record saved to server');
          }
        } catch (serverError) {
          console.log('❌ Server save failed, will save locally:', serverError.message);
        }
      }

      // Always save to IndexedDB for offline access
      try {
        await childHealthDB.saveChildRecord(record);
        console.log('✅ Record saved to IndexedDB');
      } catch (dbError) {
        console.error('❌ Failed to save to IndexedDB:', dbError);
        throw new Error('Failed to save record locally');
      }

      // Dismiss loading toast
      if (loadingToast) {
        notificationService.dismiss(loadingToast);
        loadingToast = null;
      }

      // Show success message with Health ID
      if (serverSaveSuccess) {
        notificationService.success(`Child record saved! Health ID: ${healthId}`);
      } else {
        notificationService.info(`Record saved locally. Health ID: ${healthId}`);
      }
      
      // Log successful record creation
      try {
        if (activityLogger && activityLogger.ACTIONS && activityLogger.ACTIONS.CHILD_RECORD_CREATED) {
          activityLogger.logActivity(activityLogger.ACTIONS.CHILD_RECORD_CREATED, {
            healthId,
            recordId: record.id,
            childName: record.childName,
            age: record.age,
            savedToServer: serverSaveSuccess,
            hasLocation: !!locationData,
            hasPhoto: !!record.photo,
            locationAccuracy: locationData?.accuracy
          });
        }
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }
      
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
      
      setLocationData(null);
      setLocationError(null);

      // Redirect to records list
      setTimeout(() => {
        navigate('/records');
      }, 2000);

    } catch (error) {
      // Ensure loading toast is dismissed
      if (loadingToast) {
        notificationService.dismiss(loadingToast);
      }
      console.error('Error saving record:', error);
      notificationService.error(`Error saving record: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
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
              <div className="relative">
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    // Prevent decimal input and invalid characters
                    if (e.key === '.' || e.key === ',' || e.key === '-' || e.key === '+' || e.key === 'e') {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    // Prevent pasting invalid content
                    e.preventDefault();
                    const paste = (e.clipboardData || window.clipboardData).getData('text');
                    const value = parseInt(paste);
                    if (!isNaN(value) && value >= 0 && value <= 18) {
                      setFormData(prev => ({ ...prev, age: value.toString() }));
                    }
                  }}
                  className={`form-input pr-20 ${validationErrors.age ? 'border-red-500' : ''}`}
                  min="0"
                  max="18"
                  step="1"
                  placeholder="Enter age (0-18)"
                  required
                />
                <div className="absolute right-1 top-1 bottom-1 flex flex-col">
                  <button
                    type="button"
                    onClick={() => {
                      const currentAge = parseInt(formData.age) || 0;
                      if (currentAge < 18) {
                        setFormData(prev => ({ ...prev, age: (currentAge + 1).toString() }));
                      }
                    }}
                    className="flex-1 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-t border-b border-gray-300 transition-colors"
                    aria-label="Increase age by 1"
                    title="Increase age by 1"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const currentAge = parseInt(formData.age) || 0;
                      if (currentAge > 0) {
                        setFormData(prev => ({ ...prev, age: (currentAge - 1).toString() }));
                      }
                    }}
                    className="flex-1 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-b transition-colors"
                    aria-label="Decrease age by 1"
                    title="Decrease age by 1"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                </div>
              </div>
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

          {/* Location Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-900">Location Information</h3>
              </div>
              {!locationData && !isCapturingLocation && (
                <button
                  type="button"
                  onClick={captureLocation}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Capture Location
                </button>
              )}
            </div>
            
            {isCapturingLocation && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                <span>Capturing location...</span>
              </div>
            )}
            
            {locationData && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span>Location captured successfully</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p><strong>Coordinates:</strong> {locationData.coordinateString}</p>
                  <p><strong>Accuracy:</strong> {geolocationService.getAccuracyDescription(locationData.accuracy)}</p>
                  <p><strong>Captured:</strong> {new Date(locationData.timestamp).toLocaleString()}</p>
                </div>
              </div>
            )}
            
            {locationError && (
              <div className="flex items-start space-x-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Location capture failed</p>
                  <p>{locationError}</p>
                  <p className="mt-1 text-xs">Record will be saved without location data.</p>
                </div>
              </div>
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
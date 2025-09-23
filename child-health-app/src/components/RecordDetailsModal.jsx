import React from 'react';
import { X, Download, MapPin, Calendar, User, Scale, Ruler, Heart, AlertTriangle, FileText } from 'lucide-react';
import pdfService from '../services/pdfService';
import notificationService from '../services/notificationService';

const RecordDetailsModal = ({ record, isOpen, onClose }) => {
  if (!isOpen || !record) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateBMI = (weight, height) => {
    if (weight && height) {
      const heightInM = height / 100;
      return (weight / (heightInM * heightInM)).toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return '';
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return 'Underweight';
    if (bmiValue < 25) return 'Normal';
    if (bmiValue < 30) return 'Overweight';
    return 'Obese';
  };

  const getBMIColor = (category) => {
    switch (category) {
      case 'Normal': return 'bg-green-100 text-green-800 border-green-200';
      case 'Underweight': return 'bg-red-100 text-red-800 border-red-200';
      case 'Overweight': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Obese': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const downloadPDF = async () => {
    try {
      const loadingToast = notificationService.loading('Generating PDF...');
      const pdfBlob = await pdfService.generateHealthBooklet(record);
      notificationService.dismiss(loadingToast);
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `health-booklet-${record.healthId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      notificationService.success('Health booklet downloaded successfully!');
    } catch (error) {
      console.error('PDF generation failed:', error);
      notificationService.error('Failed to generate PDF. Please try again.');
    }
  };

  const copyHealthId = () => {
    navigator.clipboard.writeText(record.healthId);
    notificationService.info('Health ID copied to clipboard!');
  };

  // Use stored BMI if available, otherwise calculate it
  const bmi = record.bmi || calculateBMI(record.weight, record.height);
  const bmiCategory = getBMICategory(bmi);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-2 sm:my-8 mx-auto max-h-[98vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 sm:px-6 py-3 sm:py-4 text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold truncate">Child Health Record Details</h2>
              <p className="text-primary-100 text-xs sm:text-sm">Complete health information</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20 flex-shrink-0 ml-2"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto">
          {/* Health ID Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Health ID</h3>
                <p className="text-2xl font-mono font-bold text-blue-700">{record.healthId}</p>
              </div>
              <button
                onClick={copyHealthId}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Copy ID
              </button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Child Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary-600" />
                  Child Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Full Name:</span>
                    <span className="text-gray-900">{record.childName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Age:</span>
                    <span className="text-gray-900">{record.age} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Parent/Guardian:</span>
                    <span className="text-gray-900">{record.parentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Parental Consent:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.parentalConsent 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.parentalConsent ? 'Provided' : 'Not Provided'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Physical Measurements */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Scale className="h-5 w-5 mr-2 text-primary-600" />
                  Physical Measurements
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Scale className="h-6 w-6 mx-auto text-blue-600 mb-1" />
                    <p className="text-sm text-gray-600">Weight</p>
                    <p className="text-lg font-bold text-blue-900">{record.weight} kg</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Ruler className="h-6 w-6 mx-auto text-green-600 mb-1" />
                    <p className="text-sm text-gray-600">Height</p>
                    <p className="text-lg font-bold text-green-900">{record.height} cm</p>
                  </div>
                </div>
                
                {bmi && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">Body Mass Index (BMI)</span>
                      <Heart className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">{bmi} kg/m²</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getBMIColor(bmiCategory)}`}>
                        {bmiCategory}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Photo */}
              {record.photo && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Child's Photograph</h3>
                  <div className="flex justify-center">
                    <img
                      src={record.photo}
                      alt="Child"
                      className="max-w-full h-48 object-cover rounded-lg border border-gray-300 shadow-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Medical History */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-600" />
                  Medical History
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visible Signs of Malnutrition:
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">
                        {record.malnutritionSigns && record.malnutritionSigns !== 'N/A' 
                          ? record.malnutritionSigns 
                          : 'No signs reported'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recent Illnesses:
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">
                        {record.recentIllnesses && record.recentIllnesses !== 'N/A' 
                          ? record.recentIllnesses 
                          : 'No recent illnesses reported'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              {record.location && record.location.latitude && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-green-600" />
                    Location Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Coordinates:</span>
                      <span className="text-gray-900 font-mono text-sm">
                        {record.location.coordinateString || `${record.location.latitude}, ${record.location.longitude}`}
                      </span>
                    </div>
                    {record.location.accuracy && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Accuracy:</span>
                        <span className="text-gray-900">±{Math.round(record.location.accuracy)}m</span>
                      </div>
                    )}
                    {record.location.formattedTime && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Captured:</span>
                        <span className="text-gray-900">{new Date(record.location.formattedTime).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Record Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  Record Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="text-gray-900">{formatDate(record.timestamp)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Representative:</span>
                    <span className="text-gray-900">{record.representativeId || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Sync Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.uploaded 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.uploaded ? 'Uploaded' : 'Pending Upload'}
                    </span>
                  </div>
                  {record.syncedAt && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Last Synced:</span>
                      <span className="text-gray-900">{formatDate(record.syncedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Record ID: {record.id} • Health ID: {record.healthId}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={downloadPDF}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordDetailsModal;
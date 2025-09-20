import React from 'react';
import { FileText, Calendar, User, Upload, CheckCircle, AlertCircle, RefreshCw, MapPin, Download } from 'lucide-react';
import childHealthDB from '../services/indexedDB';
import RecordDetailsModal from '../components/RecordDetailsModal';
import pdfService from '../services/pdfService';
import notificationService from '../services/notificationService';

const RecordsList = () => {
  const [records, setRecords] = React.useState([]);
  const [filter, setFilter] = React.useState('all'); // 'all', 'uploaded', 'pending'
  const [isLoading, setIsLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedRecord, setSelectedRecord] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  React.useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      await childHealthDB.ensureDB();
      const allRecords = await childHealthDB.getAllChildRecords();
      setRecords(allRecords);
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRecords();
    setRefreshing(false);
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const handleDownloadPDF = async (record, event) => {
    event.stopPropagation(); // Prevent modal from opening
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

  const filteredRecords = records.filter(record => {
    if (filter === 'uploaded') return record.uploaded;
    if (filter === 'pending') return !record.uploaded;
    return true;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Child Health Records</h1>
        <div className="flex items-center space-x-3">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          
          {/* Filter Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'all'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({records.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({records.filter(r => !r.uploaded).length})
            </button>
            <button
              onClick={() => setFilter('uploaded')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'uploaded'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Uploaded ({records.filter(r => r.uploaded).length})
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'Start by adding a new child health record.'
              : `No ${filter} records available.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRecords.map((record) => {
            const bmi = calculateBMI(record.weight, record.height);
            const bmiCategory = getBMICategory(bmi);
            
            return (
              <div key={record.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {record.photo ? (
                      <img
                        src={record.photo}
                        alt={record.childName}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{record.childName}</h3>
                      <p className="text-sm text-gray-500">Health ID: {record.healthId}</p>
                      {record.location && record.location.latitude && (
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>Location recorded</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {record.uploaded ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Uploaded
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Upload className="h-3 w-3 mr-1" />
                        Pending
                      </span>
                    )}
                    {record.syncStatus === 'pending' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Sync Queue
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Age:</span>
                    <span className="ml-1 text-gray-600">{record.age} years</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Weight:</span>
                    <span className="ml-1 text-gray-600">{record.weight} kg</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Height:</span>
                    <span className="ml-1 text-gray-600">{record.height} cm</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Parent:</span>
                    <span className="ml-1 text-gray-600">{record.parentName}</span>
                  </div>
                </div>

                {/* BMI Information */}
                {bmi && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">BMI:</span>
                      <span className={`text-sm font-medium px-2 py-1 rounded ${
                        bmiCategory === 'Normal' ? 'bg-green-100 text-green-800' :
                        bmiCategory === 'Underweight' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {bmi} kg/m² ({bmiCategory})
                      </span>
                    </div>
                  </div>
                )}

                {(record.malnutritionSigns && record.malnutritionSigns !== 'N/A') && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="font-medium text-gray-700">Malnutrition Signs:</span>
                    <p className="text-sm text-gray-600 mt-1">{record.malnutritionSigns}</p>
                  </div>
                )}

                {(record.recentIllnesses && record.recentIllnesses !== 'N/A') && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="font-medium text-gray-700">Recent Illnesses:</span>
                    <p className="text-sm text-gray-600 mt-1">{record.recentIllnesses}</p>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(record.timestamp)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => handleDownloadPDF(record, e)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors flex items-center space-x-1"
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                      <span>PDF</span>
                    </button>
                    <button 
                      onClick={() => handleViewDetails(record)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Record Details Modal */}
      <RecordDetailsModal
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default RecordsList;
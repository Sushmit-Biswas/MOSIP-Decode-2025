import React from 'react';
import { FileText, Calendar, User, Upload, CheckCircle } from 'lucide-react';

const RecordsList = () => {
  const [records, setRecords] = React.useState([]);
  const [filter, setFilter] = React.useState('all'); // 'all', 'uploaded', 'pending'

  React.useEffect(() => {
    const loadRecords = () => {
      const storedRecords = JSON.parse(localStorage.getItem('childRecords') || '[]');
      setRecords(storedRecords);
    };

    loadRecords();
    
    // Listen for storage changes
    window.addEventListener('storage', loadRecords);
    return () => window.removeEventListener('storage', loadRecords);
  }, []);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Child Health Records</h1>
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

      {filteredRecords.length === 0 ? (
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
          {filteredRecords.map((record) => (
            <div key={record.id} className="bg-white rounded-lg shadow p-6">
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
                  </div>
                </div>
                <div className="flex items-center space-x-2">
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
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecordsList;
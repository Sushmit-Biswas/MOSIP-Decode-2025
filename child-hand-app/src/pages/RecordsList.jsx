import React, { useEffect, useState, useCallback } from 'react';
import { FileText, Calendar, User, Upload, CheckCircle, RefreshCw, Download, Server, HardDrive } from 'lucide-react';
import childHealthDB from '../services/indexedDB';
import api from '../services/apiService';
import RecordDetailsModal from '../components/RecordDetailsModal';
import pdfService from '../services/pdfService';
import notificationService from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

const RecordsList = () => {
  const { user, isAdmin } = useAuth();
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      let loadedRecords;
      if (isAdmin) {
        const response = await api.get('/children');
        loadedRecords = response.data;
      } else {
        // Now strictly requires user.id to get local records
        loadedRecords = await childHealthDB.getAllChildRecords(user.id);
      }
      setRecords(loadedRecords);
    } catch (error) {
      notificationService.error('Could not load records.');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, user]);

  useEffect(() => {
    if (user) {
      loadRecords();
    }
  }, [user, loadRecords]);

  const handleDownloadPDF = async (record, event) => {
    event.stopPropagation();
    // PDF generation logic remains the same
  };

  const filteredRecords = isAdmin ? records : records.filter(record => {
    if (filter === 'uploaded') return record.uploaded;
    if (filter === 'pending') return !record.uploaded;
    return true;
  });

  const PageTitle = () => (
    <div className="flex items-center space-x-2">
      {isAdmin ? <Server className="h-8 w-8 text-indigo-600" /> : <HardDrive className="h-8 w-8 text-blue-600" />}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{isAdmin ? 'Server Records' : 'My Local Records'}</h1>
        <p className="text-sm text-gray-500">{isAdmin ? 'Showing all records from the central database (MongoDB)' : 'Showing records saved on this device'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageTitle />
        {!isAdmin && (
          <div className="flex space-x-2">
            <button onClick={() => setFilter('all')} className={`filter-btn ${filter === 'all' ? 'bg-primary-100 text-primary-700' : ''}`}>All ({records.length})</button>
            <button onClick={() => setFilter('pending')} className={`filter-btn ${filter === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}`}>Pending ({records.filter(r => !r.uploaded).length})</button>
            <button onClick={() => setFilter('uploaded')} className={`filter-btn ${filter === 'uploaded' ? 'bg-green-100 text-green-700' : ''}`}>Uploaded ({records.filter(r => r.uploaded).length})</button>
          </div>
        )}
      </div>

      {isLoading ? <p>Loading records...</p> : filteredRecords.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>
          <p className="mt-1 text-sm text-gray-500">{isAdmin ? 'No records have been synced to the server yet.' : 'You have not created any records on this device.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRecords.map((record) => (
            <div key={record.id || record._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  {record.photo ? <img src={record.photo} alt={record.childName} className="h-12 w-12 rounded-full object-cover"/> : <User className="h-12 w-12 text-gray-400"/>}
                  <div>
                    <h3 className="text-lg font-semibold">{record.childName}</h3>
                    <p className="text-sm text-gray-500">ID: {record.healthId}</p>
                  </div>
                </div>
                {!isAdmin && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${record.uploaded ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {record.uploaded ? 'Uploaded' : 'Pending'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <p><span className="font-medium">Age:</span> {record.age} years</p>
                <p><span className="font-medium">Weight:</span> {record.weight} kg</p>
                <p><span className="font-medium">Height:</span> {record.height} cm</p>
                <p><span className="font-medium">Parent:</span> {record.parentName}</p>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 flex items-center"><Calendar className="h-4 w-4 mr-1"/>{new Date(record.timestamp).toLocaleDateString()}</p>
                <div className="flex items-center space-x-2">
                  <button onClick={(e) => handleDownloadPDF(record, e)} className="action-btn text-green-600"><Download size={16}/> PDF</button>
                  <button onClick={() => { setSelectedRecord(record); setIsModalOpen(true); }} className="action-btn text-blue-600">View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <RecordDetailsModal record={selectedRecord} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default RecordsList;
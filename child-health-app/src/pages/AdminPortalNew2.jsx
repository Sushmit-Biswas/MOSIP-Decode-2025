import React from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Users, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  BarChart3, 
  Eye,
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  ChevronDown
} from 'lucide-react';
import childHealthDB from '../services/indexedDB';
import RecordDetailsModal from '../components/RecordDetailsModal';
import pdfService from '../services/pdfService';
import exportService from '../services/exportService';
import notificationService from '../services/notificationService';

const AdminPortalNew = () => {
  const [records, setRecords] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const [filters, setFilters] = React.useState({
    search: '',
    dateFrom: '',
    dateTo: '',
    uploaded: '',
    representative: ''
  });
  const [selectedRecord, setSelectedRecord] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('overview');
  const [stats, setStats] = React.useState({
    totalRecords: 0,
    uploadedRecords: 0,
    pendingRecords: 0,
    representatives: new Set(),
    averageBMI: 0,
    underweightCount: 0,
    normalWeightCount: 0,
    overweightCount: 0,
    malnutritionCases: 0,
    recentIllnessCases: 0
  });

  React.useEffect(() => {
    loadRecords();
  }, []);

  React.useEffect(() => {
    calculateStats();
  }, [records]);

  // Close export menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportMenu && !event.target.closest('.export-menu')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showExportMenu]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      await childHealthDB.ensureDB();
      // Only load records that have been uploaded (synced to MongoDB)
      const allRecords = await childHealthDB.getAllChildRecords();
      const uploadedRecords = allRecords.filter(record => record.uploaded === true);
      setRecords(uploadedRecords);
    } catch (error) {
      console.error('Failed to load records:', error);
      notificationService.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (records.length === 0) return;

    const representatives = new Set(records.map(r => r.representativeId).filter(Boolean));
    let totalBMI = 0;
    let bmiCount = 0;
    let underweight = 0;
    let normal = 0;
    let overweight = 0;
    let malnutrition = 0;
    let recentIllness = 0;

    records.forEach(record => {
      // BMI calculations
      if (record.weight && record.height) {
        const heightInM = record.height / 100;
        const bmi = record.weight / (heightInM * heightInM);
        totalBMI += bmi;
        bmiCount++;

        if (bmi < 18.5) underweight++;
        else if (bmi < 25) normal++;
        else overweight++;
      }

      // Health conditions
      if (record.malnutritionSigns && record.malnutritionSigns !== 'N/A' && record.malnutritionSigns.trim() !== '') {
        malnutrition++;
      }
      if (record.recentIllnesses && record.recentIllnesses !== 'N/A' && record.recentIllnesses.trim() !== '') {
        recentIllness++;
      }
    });

    setStats({
      totalRecords: records.length,
      uploadedRecords: records.filter(r => r.uploaded).length,
      pendingRecords: records.filter(r => !r.uploaded).length,
      representatives,
      averageBMI: bmiCount > 0 ? (totalBMI / bmiCount).toFixed(1) : 0,
      underweightCount: underweight,
      normalWeightCount: normal,
      overweightCount: overweight,
      malnutritionCases: malnutrition,
      recentIllnessCases: recentIllness
    });
  };

  const filteredRecords = records.filter(record => {
    let matches = true;
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      matches = matches && (
        record.childName.toLowerCase().includes(searchLower) ||
        record.parentName.toLowerCase().includes(searchLower) ||
        record.healthId.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.dateFrom) {
      matches = matches && new Date(record.timestamp) >= new Date(filters.dateFrom);
    }
    
    if (filters.dateTo) {
      matches = matches && new Date(record.timestamp) <= new Date(filters.dateTo);
    }
    
    if (filters.uploaded !== '') {
      matches = matches && (record.uploaded === (filters.uploaded === 'true'));
    }
    
    if (filters.representative) {
      matches = matches && record.representativeId === filters.representative;
    }
    
    return matches;
  });

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  // Export handlers
  const handleDownloadPDF = async () => {
    try {
      setShowExportMenu(false);
      const loadingToast = notificationService.loading('Generating PDF report...');
      const pdfBlob = await pdfService.generateSummaryReport(filteredRecords);
      notificationService.dismiss(loadingToast);
      
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sehat-saathi-records-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      notificationService.success('PDF report downloaded successfully!');
    } catch (error) {
      console.error('PDF generation failed:', error);
      notificationService.error('Failed to generate PDF report');
    }
  };

  const handleDownloadCSV = async () => {
    try {
      setShowExportMenu(false);
      const loadingToast = notificationService.loading('Generating CSV export...');
      const csvContent = exportService.generateCSV(filteredRecords);
      notificationService.dismiss(loadingToast);
      
      const filename = `sehat-saathi-records-${new Date().toISOString().split('T')[0]}.csv`;
      exportService.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
      
      notificationService.success('CSV export downloaded successfully!');
    } catch (error) {
      console.error('CSV generation failed:', error);
      notificationService.error('Failed to generate CSV export: ' + error.message);
    }
  };

  const handleDownloadTXT = async () => {
    try {
      setShowExportMenu(false);
      const loadingToast = notificationService.loading('Generating TXT export...');
      const txtContent = exportService.generateTXT(filteredRecords);
      notificationService.dismiss(loadingToast);
      
      const filename = `sehat-saathi-records-${new Date().toISOString().split('T')[0]}.txt`;
      exportService.downloadFile(txtContent, filename, 'text/plain;charset=utf-8;');
      
      notificationService.success('TXT export downloaded successfully!');
    } catch (error) {
      console.error('TXT generation failed:', error);
      notificationService.error('Failed to generate TXT export: ' + error.message);
    }
  };

  const handleDownloadActivityLogs = async () => {
    try {
      setShowExportMenu(false);
      const loadingToast = notificationService.loading('Generating activity logs...');
      const csvContent = exportService.generateActivityLogsCSV();
      notificationService.dismiss(loadingToast);
      
      const filename = `sehat-saathi-activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
      exportService.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
      
      notificationService.success('Activity logs downloaded successfully!');
    } catch (error) {
      console.error('Activity logs generation failed:', error);
      notificationService.error('Failed to generate activity logs: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle = null }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-full`}>
          <Icon className={`h-8 w-8 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-primary-100 mt-2">Child Health Record Management System - Synced Records Only</p>
          </div>
          <div className="text-right">
            <p className="text-primary-100">Total Synced Records</p>
            <p className="text-4xl font-bold">{stats.totalRecords}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Records" 
          value={stats.totalRecords} 
          icon={FileText} 
          color="blue" 
        />
        <StatCard 
          title="Uploaded" 
          value={stats.uploadedRecords} 
          icon={CheckCircle} 
          color="green" 
          subtitle="100% synced"
        />
        <StatCard 
          title="Field Representatives" 
          value={stats.representatives.size} 
          icon={Users} 
          color="purple" 
        />
        <StatCard 
          title="Average BMI" 
          value={stats.averageBMI} 
          icon={Activity} 
          color="orange" 
          subtitle="kg/m²"
        />
      </div>

      {/* Filters and Export */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filters & Export
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 form-input"
                placeholder="Name or Health ID"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="form-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="form-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Representative</label>
            <select
              value={filters.representative}
              onChange={(e) => setFilters(prev => ({ ...prev, representative: e.target.value }))}
              className="form-input"
            >
              <option value="">All Representatives</option>
              {Array.from(stats.representatives).map((repId) => (
                <option key={repId} value={repId}>{repId}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="relative export-menu w-full">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export Data</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showExportMenu && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={handleDownloadPDF}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <span>📄</span>
                      <span>Export as PDF</span>
                    </button>
                    <button
                      onClick={handleDownloadCSV}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <span>📊</span>
                      <span>Export as CSV</span>
                    </button>
                    <button
                      onClick={handleDownloadTXT}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <span>📝</span>
                      <span>Export as TXT</span>
                    </button>
                    <button
                      onClick={handleDownloadActivityLogs}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <span>📋</span>
                      <span>Activity Logs (CSV)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Child Information
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Measurements
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => {
                const bmi = record.bmi || (record.weight && record.height 
                  ? (record.weight / Math.pow(record.height / 100, 2)).toFixed(1)
                  : 'N/A');
                
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{record.childName}</div>
                        <div className="text-sm text-gray-500">ID: {record.healthId}</div>
                        <div className="text-sm text-gray-500">Age: {record.age} years</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {record.weight}kg / {record.height}cm
                      </div>
                      <div className="text-sm text-gray-500">BMI: {bmi}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(record.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Synced
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(record)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No synced records found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Records will appear here after field representatives sync their data
            </p>
          </div>
        )}
      </div>

      {/* Record Details Modal */}
      <RecordDetailsModal
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default AdminPortalNew;
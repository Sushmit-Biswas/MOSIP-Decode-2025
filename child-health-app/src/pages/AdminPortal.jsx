import React from 'react';
import { Search, Filter, Download, Users, TrendingUp, Calendar, MapPin, BarChart3 } from 'lucide-react';
import apiService from '../services/apiService';

const AdminPortal = () => {
  const [records, setRecords] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState({
    search: '',
    dateFrom: '',
    dateTo: '',
    uploaded: '',
    representative: ''
  });
  const [pagination, setPagination] = React.useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });
  const [stats, setStats] = React.useState({
    totalRecords: 0,
    uploadedRecords: 0,
    pendingRecords: 0,
    representatives: 0
  });

  React.useEffect(() => {
    loadRecords();
    loadStats();
  }, [filters, pagination.currentPage]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const queryParams = {
        page: pagination.currentPage,
        limit: 10,
        ...filters
      };
      
      // Remove empty filters
      Object.keys(queryParams).forEach(key => {
        if (!queryParams[key]) delete queryParams[key];
      });

      const response = await apiService.getChildren(queryParams);
      
      if (response.success) {
        setRecords(response.data);
        setPagination(response.pagination || pagination);
      }
    } catch (error) {
      console.error('Failed to load records:', error);
      // Fallback to mock data for demo
      setRecords([
        {
          _id: '1',
          healthId: 'CHR123456789',
          childName: 'John Doe',
          age: 5,
          weight: 18.5,
          height: 110,
          parentName: 'Jane Doe',
          createdAt: new Date().toISOString(),
          uploaded: true,
          representativeId: 'rep123'
        },
        {
          _id: '2',
          healthId: 'CHR987654321',
          childName: 'Mary Smith',
          age: 3,
          weight: 12.5,
          height: 85,
          parentName: 'Sarah Smith',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          uploaded: false,
          representativeId: 'rep456'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Calculate stats from current data
      const total = records.length;
      const uploaded = records.filter(r => r.uploaded).length;
      const pending = total - uploaded;
      const uniqueReps = new Set(records.map(r => r.representativeId)).size;

      setStats({
        totalRecords: total,
        uploadedRecords: uploaded,
        pendingRecords: pending,
        representatives: uniqueReps
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      dateFrom: '',
      dateTo: '',
      uploaded: '',
      representative: ''
    });
  };

  const downloadHealthBooklet = async (healthId) => {
    try {
      const blob = await apiService.downloadHealthBooklet(healthId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `health-booklet-${healthId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download booklet:', error);
      alert('Failed to download health booklet. Please try again.');
    }
  };

  const exportData = () => {
    const csv = [
      ['Health ID', 'Child Name', 'Age', 'Weight', 'Height', 'Parent', 'Created', 'Status'],
      ...records.map(r => [
        r.healthId,
        r.childName,
        r.age,
        r.weight,
        r.height,
        r.parentName,
        new Date(r.createdAt).toLocaleDateString(),
        r.uploaded ? 'Uploaded' : 'Pending'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `child-health-records-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return 'N/A';
    const heightInM = height / 100;
    return (weight / (heightInM * heightInM)).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
          <p className="mt-2 text-gray-600">Manage and analyze child health records</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Uploaded</p>
                <p className="text-2xl font-bold text-gray-900">{stats.uploadedRecords}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingRecords}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Representatives</p>
                <p className="text-2xl font-bold text-gray-900">{stats.representatives}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filters & Search</h2>
            <button
              onClick={resetFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Reset Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Name, Health ID..."
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.uploaded}
                onChange={(e) => handleFilterChange('uploaded', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Records</option>
                <option value="true">Uploaded</option>
                <option value="false">Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Records ({pagination.totalCount || records.length})
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={exportData}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </button>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading records...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>
              <p className="mt-1 text-sm text-gray-500">No child health records match your current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Child
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Health Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
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
                  {records.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{record.childName}</div>
                          <div className="text-sm text-gray-500">ID: {record.healthId}</div>
                          <div className="text-sm text-gray-500">Age: {record.age} years</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {record.weight}kg, {record.height}cm
                        </div>
                        <div className="text-sm text-gray-500">
                          BMI: {calculateBMI(record.weight, record.height)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.parentName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(record.createdAt)}</div>
                        <div className="text-sm text-gray-500">Rep: {record.representativeId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.uploaded 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.uploaded ? 'Uploaded' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => downloadHealthBooklet(record.healthId)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Download PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={pagination.currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPortal;
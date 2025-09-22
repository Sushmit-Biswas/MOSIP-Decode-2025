import React from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Users, 
  TrendingUp, 
  BarChart3, 
  Eye, 
  FileText,
  Activity, 
  AlertTriangle,
  CheckCircle, 
  Clock,
  MapPin,
  UserCheck
} from 'lucide-react';
import childHealthDB from '../services/indexedDB';
import activityLogger from '../services/activityLogger';
import RecordDetailsModal from '../components/RecordDetailsModal';
import pdfService from '../services/pdfService';
import notificationService from '../services/notificationService';

// Component helper functions
const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
      active 
        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
    }`}
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
  </button>
);

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    purple: 'text-purple-600 bg-purple-100',
    red: 'text-red-600 bg-red-100'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color] || colorClasses.blue}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

// Activity Logs Tab Component
const ActivityLogsTab = () => {
  const [activities, setActivities] = React.useState([]);
  const [filteredActivities, setFilteredActivities] = React.useState([]);
  const [filters, setFilters] = React.useState({
    action: '',
    userRole: '',
    dateFrom: '',
    dateTo: new Date().toISOString().split('T')[0]
  });
  const [stats, setStats] = React.useState({});

  const loadActivities = React.useCallback(() => {
    const allActivities = activityLogger.getActivities();
    const activityStats = activityLogger.getActivityStats();
    setActivities(allActivities);
    setStats(activityStats);
  }, []);

  const applyFilters = React.useCallback(() => {
    const filtered = activityLogger.getFilteredActivities(filters);
    setFilteredActivities(filtered);
  }, [filters]);

  React.useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const exportLogs = () => {
    const exportData = activityLogger.exportActivities(filters);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notificationService.success('Activity logs exported successfully');
  };

  const getActionColor = (action) => {
    const colorMap = {
      'login': 'bg-green-100 text-green-800',
      'logout': 'bg-gray-100 text-gray-800',
      'child_record_created': 'bg-blue-100 text-blue-800',
      'location_captured': 'bg-purple-100 text-purple-800',
      'sync_started': 'bg-yellow-100 text-yellow-800',
      'sync_completed': 'bg-green-100 text-green-800',
      'sync_failed': 'bg-red-100 text-red-800',
      'photo_captured': 'bg-indigo-100 text-indigo-800'
    };
    return colorMap[action] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Activities"
          value={stats.total || 0}
          icon={Activity}
          color="blue"
        />
        <StatCard
          title="Active Users"
          value={stats.users || 0}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Active Sessions"
          value={stats.sessions || 0}
          icon={Clock}
          color="purple"
        />
        <StatCard
          title="Today's Activities"
          value={stats.dailyActivity?.[new Date().toISOString().split('T')[0]] || 0}
          icon={TrendingUp}
          color="yellow"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              <option value="login">Login</option>
              <option value="child_record_created">Record Created</option>
              <option value="location_captured">Location Captured</option>
              <option value="sync_started">Sync Started</option>
              <option value="sync_completed">Sync Completed</option>
              <option value="photo_captured">Photo Captured</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User Role</label>
            <select
              value={filters.userRole}
              onChange={(e) => handleFilterChange('userRole', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="field_representative">Field Representative</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={exportLogs}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export Logs</span>
          </button>
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
          <p className="text-sm text-gray-500">Showing {filteredActivities.length} activities</p>
        </div>
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {filteredActivities.length > 0 ? (
            filteredActivities.slice(0, 100).map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(activity.action)}`}>
                        {activity.action.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-900 mb-1">
                      <strong>{activity.user?.name || 'Unknown User'}</strong> 
                      <span className="text-gray-600"> ({activity.user?.role?.replace('_', ' ') || 'Unknown Role'})</span>
                    </div>
                    {activity.details && Object.keys(activity.details).length > 0 && (
                      <div className="text-xs text-gray-500 mt-2">
                        {Object.entries(activity.details).map(([key, value]) => (
                          <span key={key} className="mr-4">
                            <strong>{key}:</strong> {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                    {activity.location && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                        <MapPin className="h-3 w-3" />
                        <span>{activity.location.coordinateString} (±{Math.round(activity.location.accuracy)}m)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              No activities found matching the current filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Field Representatives Tab Component
const FieldRepsTab = () => {
  const [fieldReps, setFieldReps] = React.useState([]);
  const [activities, setActivities] = React.useState([]);

  React.useEffect(() => {
    loadFieldRepData();
  }, []);

  const loadFieldRepData = () => {
    const allActivities = activityLogger.getActivities();
    const stats = activityLogger.getActivityStats();
    
    // Extract field rep information from activities
    const repsData = Object.entries(stats.userActivity)
      .filter(([, data]) => data.role === 'field_representative')
      .map(([userId, data]) => ({
        id: userId,
        ...data,
        userId
      }));
    
    setFieldReps(repsData);
    setActivities(allActivities.filter(a => a.user?.role === 'field_representative'));
  };

  const getRepStatus = (lastActivity) => {
    const now = new Date();
    const last = new Date(lastActivity);
    const diffHours = (now - last) / (1000 * 60 * 60);
    
    if (diffHours < 1) return { status: 'active', color: 'bg-green-100 text-green-800', text: 'Active' };
    if (diffHours < 24) return { status: 'recent', color: 'bg-yellow-100 text-yellow-800', text: 'Recent' };
    return { status: 'inactive', color: 'bg-gray-100 text-gray-800', text: 'Inactive' };
  };

  const getRepLocation = (userId) => {
    const userActivities = activities
      .filter(a => a.user?.nationalId === userId && a.location)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return userActivities[0]?.location || null;
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Field Representatives"
          value={fieldReps.length}
          icon={UserCheck}
          color="blue"
        />
        <StatCard
          title="Active Today"
          value={fieldReps.filter(rep => {
            const { status } = getRepStatus(rep.lastActivity);
            return status === 'active';
          }).length}
          icon={Activity}
          color="green"
        />
        <StatCard
          title="Total Records Created"
          value={fieldReps.reduce((sum, rep) => sum + (rep.actions?.child_record_created || 0), 0)}
          icon={FileText}
          color="purple"
        />
      </div>

      {/* Field Representatives List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Field Representatives</h3>
          <p className="text-sm text-gray-500">Monitor field representative activities and locations</p>
        </div>
        <div className="divide-y divide-gray-200">
          {fieldReps.length > 0 ? (
            fieldReps.map((rep) => {
              const { color, text } = getRepStatus(rep.lastActivity);
              const location = getRepLocation(rep.userId);
              
              return (
                <div key={rep.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{rep.name}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>
                          {text}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">ID:</span> {rep.userId}
                        </div>
                        <div>
                          <span className="font-medium">Total Activities:</span> {rep.count}
                        </div>
                        <div>
                          <span className="font-medium">Last Active:</span> {new Date(rep.lastActivity).toLocaleString()}
                        </div>
                      </div>
                      
                      {/* Activity Breakdown */}
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Activity Breakdown:</h5>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(rep.actions || {}).map(([action, count]) => (
                            <span key={action} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {action.replace('_', ' ')}: {count}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Location Information */}
                      {location && (
                        <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>Last Location: {location.coordinateString} (±{Math.round(location.accuracy)}m)</span>
                          <span className="text-xs text-gray-500">
                            - {new Date(location.formattedTime).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-gray-500">
              No field representative data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
  }, [loadRecords]);

  const calculateStats = React.useCallback(() => {
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
  }, [records]);

  React.useEffect(() => {
    calculateStats();
  }, [records, calculateStats]);

  const createDemoData = React.useCallback(async () => {
    try {
      const demoRecords = [
        {
          id: 'demo_001',
          healthId: 'CHR001',
          childName: 'Aarav Sharma',
          age: 5,
          weight: 18.5,
          height: 110,
          parentName: 'Priya Sharma',
          malnutritionSigns: 'None',
          recentIllnesses: 'Cold last month',
          timestamp: new Date(2025, 8, 20).toISOString(),
          uploaded: true,
          representativeId: '2304715938',
          location: { latitude: 12.9716, longitude: 77.5946, accuracy: 10 }
        },
        {
          id: 'demo_002',
          healthId: 'CHR002',
          childName: 'Kavya Patel',
          age: 7,
          weight: 22.0,
          height: 122,
          parentName: 'Amit Patel',
          malnutritionSigns: 'Mild underweight',
          recentIllnesses: 'None',
          timestamp: new Date(2025, 8, 21).toISOString(),
          uploaded: false,
          representativeId: '1234567890',
          location: { latitude: 12.9716, longitude: 77.5946, accuracy: 15 }
        },
        {
          id: 'demo_003',
          healthId: 'CHR003',
          childName: 'Rohan Singh',
          age: 3,
          weight: 13.2,
          height: 95,
          parentName: 'Rajesh Singh',
          malnutritionSigns: 'None',
          recentIllnesses: 'Fever last week',
          timestamp: new Date(2025, 8, 22).toISOString(),
          uploaded: true,
          representativeId: '2304715938',
          location: { latitude: 12.9716, longitude: 77.5946, accuracy: 8 }
        },
        {
          id: 'demo_004',
          healthId: 'CHR004',
          childName: 'Ananya Kumar',
          age: 6,
          weight: 19.8,
          height: 115,
          parentName: 'Sunita Kumar',
          malnutritionSigns: 'None',
          recentIllnesses: 'None',
          timestamp: new Date(2025, 8, 19).toISOString(),
          uploaded: true,
          representativeId: 'FR001',
          location: { latitude: 12.9716, longitude: 77.5946, accuracy: 12 }
        },
        {
          id: 'demo_005',
          healthId: 'CHR005',
          childName: 'Arjun Mehta',
          age: 4,
          weight: 15.5,
          height: 102,
          parentName: 'Neha Mehta',
          malnutritionSigns: 'Signs of malnutrition observed',
          recentIllnesses: 'Diarrhea',
          timestamp: new Date(2025, 8, 18).toISOString(),
          uploaded: false,
          representativeId: '1234567890',
          location: { latitude: 12.9716, longitude: 77.5946, accuracy: 20 }
        }
      ];

      // Add demo records to IndexedDB
      for (const record of demoRecords) {
        await childHealthDB.addChildRecord(record);
      }
      
      console.log('AdminPortal: Demo data created successfully');
      notificationService.success('Demo data loaded for presentation');
    } catch (error) {
      console.error('AdminPortal: Failed to create demo data:', error);
    }
  }, []);

  const loadRecords = React.useCallback(async () => {
    setLoading(true);
    try {
      console.log('AdminPortal: Loading records...');
      await childHealthDB.ensureDB();
      const allRecords = await childHealthDB.getAllChildRecords();
      console.log('AdminPortal: Records loaded:', allRecords.length);
      
      // If no records exist, add demo data for better presentation
      if (allRecords.length === 0) {
        console.log('AdminPortal: No records found, creating demo data...');
        await createDemoData();
        const demoRecords = await childHealthDB.getAllChildRecords();
        console.log('AdminPortal: Demo records created:', demoRecords.length);
        setRecords(demoRecords);
      } else {
        setRecords(allRecords);
      }
    } catch (error) {
      console.error('AdminPortal: Failed to load records:', error);
      notificationService.error('Failed to load records');
      // Set empty array so the component still renders
      setRecords([]);
    } finally {
      setLoading(false);
      console.log('AdminPortal: Loading complete');
    }
  }, [createDemoData]);

  // Utility functions
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      console.error('Date formatting error:', err);
      return 'Invalid date';
    }
  };

  const _handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  // Filter records based on current filters
  const filteredRecords = records.filter(record => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!record.childName?.toLowerCase().includes(searchLower) && 
          !record.healthId?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    if (filters.dateFrom) {
      const recordDate = new Date(record.timestamp);
      const fromDate = new Date(filters.dateFrom);
      if (recordDate < fromDate) return false;
    }
    
    if (filters.dateTo) {
      const recordDate = new Date(record.timestamp);
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      if (recordDate > toDate) return false;
    }
    
    if (filters.uploaded !== '') {
      const isUploaded = filters.uploaded === 'true';
      if (record.uploaded !== isUploaded) return false;
    }
    
    return true;
  });

  const _handleViewDetails = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const _handleDownloadSummary = async () => {
    try {
      const loadingToast = notificationService.loading('Generating summary report...');
      const pdfBlob = await pdfService.generateSummaryReport(filteredRecords);
      notificationService.dismiss(loadingToast);
      
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `child-health-summary-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      notificationService.success('Summary report downloaded successfully!');
    } catch (error) {
      console.error('PDF generation failed:', error);
      notificationService.error('Failed to generate summary report.');
    }
  };

  const _formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // eslint-disable-next-line no-unused-vars
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

  // eslint-disable-next-line no-unused-vars
  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        active 
          ? 'bg-primary-100 text-primary-700 border border-primary-200' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );

  if (loading) {
    console.log('AdminPortal: Loading...');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  console.log('AdminPortal: Rendering with records:', records.length);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-blue-100 mt-2">Child Health Record Management System</p>
          </div>
          <div className="text-right">
            <p className="text-blue-100">Total Records</p>
            <p className="text-4xl font-bold">{stats.totalRecords}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 pb-4">
        <TabButton 
          id="overview" 
          label="Overview" 
          icon={BarChart3} 
          active={activeTab === 'overview'}
          onClick={setActiveTab} 
        />
        <TabButton 
          id="records" 
          label="Records" 
          icon={FileText} 
          active={activeTab === 'records'} 
          onClick={setActiveTab} 
        />
        <TabButton 
          id="analytics" 
          label="Analytics" 
          icon={TrendingUp} 
          active={activeTab === 'analytics'} 
          onClick={setActiveTab} 
        />
        <TabButton 
          id="activity-logs" 
          label="Activity Logs" 
          icon={Activity} 
          active={activeTab === 'activity-logs'} 
          onClick={setActiveTab} 
        />
        <TabButton 
          id="field-reps" 
          label="Field Representatives" 
          icon={UserCheck} 
          active={activeTab === 'field-reps'} 
          onClick={setActiveTab} 
        />
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
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
              subtitle={`${((stats.uploadedRecords / stats.totalRecords) * 100 || 0).toFixed(1)}% of total`}
            />
            <StatCard 
              title="Pending Sync" 
              value={stats.pendingRecords} 
              icon={Clock} 
              color="yellow" 
              subtitle={`${((stats.pendingRecords / stats.totalRecords) * 100 || 0).toFixed(1)}% of total`}
            />
            <StatCard 
              title="Field Representatives" 
              value={stats.representatives.size} 
              icon={Users} 
              color="purple" 
            />
          </div>

          {/* Health Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* BMI Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-600" />
                BMI Distribution
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average BMI</span>
                  <span className="font-semibold text-lg">{stats.averageBMI} kg/m²</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-600">Underweight</span>
                    <span className="font-medium">{stats.underweightCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${(stats.underweightCount / (stats.totalRecords || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-600">Normal Weight</span>
                    <span className="font-medium">{stats.normalWeightCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(stats.normalWeightCount / (stats.totalRecords || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-orange-600">Overweight</span>
                    <span className="font-medium">{stats.overweightCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${(stats.overweightCount / (stats.totalRecords || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Alerts */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Health Alerts
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-800">Malnutrition Cases</span>
                    <span className="text-xl font-bold text-red-900">{stats.malnutritionCases}</span>
                  </div>
                  <p className="text-xs text-red-600 mt-1">
                    {((stats.malnutritionCases / (stats.totalRecords || 1)) * 100).toFixed(1)}% of total records
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-yellow-800">Recent Illness Cases</span>
                    <span className="text-xl font-bold text-yellow-900">{stats.recentIllnessCases}</span>
                  </div>
                  <p className="text-xs text-yellow-600 mt-1">
                    {((stats.recentIllnessCases / (stats.totalRecords || 1)) * 100).toFixed(1)}% of total records
                  </p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800">Underweight Children</span>
                    <span className="text-xl font-bold text-blue-900">{stats.underweightCount}</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Requires nutritional intervention
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* No Data State */}
          {stats.totalRecords === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-500 mb-4">
                No child health records have been collected yet. Data will appear here once field representatives start collecting information.
              </p>
              <div className="text-sm text-gray-400">
                <p>To get started:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Field representatives can log in and add child records</li>
                  <li>Data will be stored locally and synced when online</li>
                  <li>Analytics and insights will be generated automatically</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Records Tab */}
      {activeTab === 'records' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
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
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sync Status</label>
                <select
                  value={filters.uploaded}
                  onChange={(e) => setFilters(prev => ({ ...prev, uploaded: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="true">Uploaded</option>
                  <option value="false">Pending</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={_handleDownloadSummary}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {filteredRecords.length > 0 ? (
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
                      const bmi = record.weight && record.height 
                        ? (record.weight / Math.pow(record.height / 100, 2)).toFixed(1)
                        : 'N/A';
                      
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
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              record.uploaded 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {record.uploaded ? 'Uploaded' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            <button
                              onClick={() => _handleViewDetails(record)}
                              className="text-blue-600 hover:text-blue-900"
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
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {records.length === 0 
                    ? 'No child records have been added yet.' 
                    : 'Try adjusting your filters to see more results.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {records.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Age Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>
                <div className="space-y-3">
                  {[0, 2, 5, 10, 15].map((minAge, index, arr) => {
                    const maxAge = arr[index + 1] || 18;
                    const count = records.filter(r => r.age >= minAge && r.age < maxAge).length;
                    const percentage = (count / records.length) * 100 || 0;
                    
                    return (
                      <div key={minAge} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {minAge === 15 ? '15-18 years' : `${minAge}-${maxAge - 1} years`}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Representative Performance */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Representative Performance</h3>
                <div className="space-y-3">
                  {Array.from(stats.representatives).length > 0 ? (
                    Array.from(stats.representatives).map((repId) => {
                      const repRecords = records.filter(r => r.representativeId === repId);
                      const uploaded = repRecords.filter(r => r.uploaded).length;
                      
                      return (
                        <div key={repId} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 truncate">{repId}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">{uploaded}/{repRecords.length}</span>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${(uploaded / repRecords.length) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-sm">No representative data available</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
              <p className="text-gray-500">
                Analytics will be available once child health records are collected and uploaded.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Activity Logs Tab */}
      {activeTab === 'activity-logs' && (
        <ActivityLogsTab />
      )}

      {/* Field Representatives Tab */}
      {activeTab === 'field-reps' && (
        <FieldRepsTab />
      )}

      {/* Record Details Modal */}
      <RecordDetailsModal
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={_handleCloseModal}
      />
    </div>
  );
};

export default AdminPortal;

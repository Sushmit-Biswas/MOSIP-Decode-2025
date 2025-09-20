import React from 'react';
import { Heart, Users, FileText, Upload } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = React.useState({
    totalRecords: 0,
    pendingUploads: 0,
    uploadedRecords: 0,
  });

  React.useEffect(() => {
    // Load stats from local storage
    const loadStats = () => {
      const records = JSON.parse(localStorage.getItem('childRecords') || '[]');
      const uploaded = records.filter(record => record.uploaded).length;
      const pending = records.filter(record => !record.uploaded).length;
      
      setStats({
        totalRecords: records.length,
        pendingUploads: pending,
        uploadedRecords: uploaded,
      });
    };

    loadStats();
    
    // Listen for storage changes
    window.addEventListener('storage', loadStats);
    return () => window.removeEventListener('storage', loadStats);
  }, []);

  const statCards = [
    {
      title: 'Total Records',
      value: stats.totalRecords,
      icon: FileText,
      color: 'blue',
    },
    {
      title: 'Pending Uploads',
      value: stats.pendingUploads,
      icon: Upload,
      color: 'yellow',
    },
    {
      title: 'Uploaded Records',
      value: stats.uploadedRecords,
      icon: Users,
      color: 'green',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map(({ title, value, icon: Icon, color }) => (
          <div key={title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-md bg-${color}-100`}>
                <Icon className={`h-6 w-6 text-${color}-600`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-semibold text-gray-900">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Welcome to Child Health Record</h2>
        <p className="text-gray-600 mb-4">
          This application helps field representatives collect child health data in remote areas, 
          even when offline. Data is stored locally and can be uploaded when internet connectivity is available.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Offline Collection</h3>
            <p className="text-sm text-gray-600">
              Collect child health data without internet connection. All data is stored securely on your device.
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Secure Upload</h3>
            <p className="text-sm text-gray-600">
              Upload data securely using eSignet authentication when internet becomes available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
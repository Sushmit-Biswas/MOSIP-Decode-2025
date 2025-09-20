import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { TrendingUp, Users, AlertTriangle, MapPin, Calendar, Activity } from 'lucide-react';
import apiService from '../services/apiService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const AnalyticsDashboard = () => {
  const [data, setData] = React.useState({
    records: [],
    stats: {
      totalChildren: 0,
      malnutritionCases: 0,
      averageAge: 0,
      averageBMI: 0
    }
  });
  const [loading, setLoading] = React.useState(true);
  const [dateRange, setDateRange] = React.useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  React.useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await apiService.getChildren({
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        limit: 1000 // Get more data for analytics
      });

      let records = [];
      if (response.success) {
        records = response.data;
      } else {
        // Fallback mock data for demo
        records = generateMockData();
      }

      const stats = calculateStats(records);
      setData({ records, stats });
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      // Use mock data for demo
      const records = generateMockData();
      const stats = calculateStats(records);
      setData({ records, stats });
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const mockRecords = [];
    const names = ['John', 'Mary', 'David', 'Sarah', 'Michael', 'Emma', 'James', 'Lisa', 'Robert', 'Anna'];
    const surnames = ['Doe', 'Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson'];
    
    for (let i = 0; i < 50; i++) {
      const age = Math.floor(Math.random() * 17) + 1;
      const weight = 5 + age * 2.5 + (Math.random() - 0.5) * 5;
      const height = 50 + age * 5 + (Math.random() - 0.5) * 10;
      const createdDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      mockRecords.push({
        _id: `mock_${i}`,
        healthId: `CHR${Date.now()}${i}`,
        childName: `${names[Math.floor(Math.random() * names.length)]} ${surnames[Math.floor(Math.random() * surnames.length)]}`,
        age,
        weight: Math.max(5, weight),
        height: Math.max(50, height),
        parentName: `Parent ${i + 1}`,
        malnutritionSigns: Math.random() > 0.8 ? 'Some signs observed' : 'None observed',
        recentIllnesses: Math.random() > 0.7 ? 'Recent cold' : 'None',
        createdAt: createdDate.toISOString(),
        uploaded: Math.random() > 0.3,
        representativeId: `rep${Math.floor(Math.random() * 5) + 1}`
      });
    }
    
    return mockRecords;
  };

  const calculateStats = (records) => {
    const totalChildren = records.length;
    const malnutritionCases = records.filter(r => 
      r.malnutritionSigns && r.malnutritionSigns !== 'None observed' && r.malnutritionSigns !== 'N/A'
    ).length;
    
    const totalAge = records.reduce((sum, r) => sum + r.age, 0);
    const averageAge = totalChildren > 0 ? (totalAge / totalChildren).toFixed(1) : 0;
    
    const bmis = records.map(r => {
      if (r.weight && r.height) {
        const heightInM = r.height / 100;
        return r.weight / (heightInM * heightInM);
      }
      return null;
    }).filter(bmi => bmi !== null);
    
    const averageBMI = bmis.length > 0 ? (bmis.reduce((sum, bmi) => sum + bmi, 0) / bmis.length).toFixed(1) : 0;
    
    return {
      totalChildren,
      malnutritionCases,
      averageAge,
      averageBMI
    };
  };

  const getAgeDistributionData = () => {
    const ageGroups = {
      '0-2 years': 0,
      '3-5 years': 0,
      '6-10 years': 0,
      '11-15 years': 0,
      '16-18 years': 0
    };

    data.records.forEach(record => {
      const age = record.age;
      if (age <= 2) ageGroups['0-2 years']++;
      else if (age <= 5) ageGroups['3-5 years']++;
      else if (age <= 10) ageGroups['6-10 years']++;
      else if (age <= 15) ageGroups['11-15 years']++;
      else ageGroups['16-18 years']++;
    });

    return {
      labels: Object.keys(ageGroups),
      datasets: [{
        label: 'Number of Children',
        data: Object.values(ageGroups),
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  };

  const getBMIDistributionData = () => {
    const bmiCategories = {
      'Underweight': 0,
      'Normal': 0,
      'Overweight': 0,
      'Obese': 0
    };

    data.records.forEach(record => {
      if (record.weight && record.height) {
        const heightInM = record.height / 100;
        const bmi = record.weight / (heightInM * heightInM);
        
        if (bmi < 18.5) bmiCategories['Underweight']++;
        else if (bmi < 25) bmiCategories['Normal']++;
        else if (bmi < 30) bmiCategories['Overweight']++;
        else bmiCategories['Obese']++;
      }
    });

    return {
      labels: Object.keys(bmiCategories),
      datasets: [{
        label: 'Number of Children',
        data: Object.values(bmiCategories),
        backgroundColor: [
          '#ef4444',
          '#10b981',
          '#f59e0b',
          '#dc2626'
        ]
      }]
    };
  };

  const getMonthlyTrendsData = () => {
    const monthlyData = {};
    
    data.records.forEach(record => {
      const date = new Date(record.createdAt);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      monthlyData[monthKey]++;
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    
    return {
      labels: sortedMonths.map(month => {
        const [year, monthNum] = month.split('-');
        return new Date(year, monthNum - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }),
      datasets: [{
        label: 'Records Created',
        data: sortedMonths.map(month => monthlyData[month]),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  };

  const getRepresentativePerformanceData = () => {
    const repData = {};
    
    data.records.forEach(record => {
      const rep = record.representativeId || 'Unknown';
      if (!repData[rep]) {
        repData[rep] = 0;
      }
      repData[rep]++;
    });

    const sortedReps = Object.entries(repData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10); // Top 10 representatives

    return {
      labels: sortedReps.map(([rep]) => rep),
      datasets: [{
        label: 'Records Collected',
        data: sortedReps.map(([, count]) => count),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 1
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">Health trends and insights from collected data</p>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">From</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">To</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="pt-6">
              <button
                onClick={loadAnalyticsData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Children</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.totalChildren}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Malnutrition Cases</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.malnutritionCases}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Age</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.averageAge} years</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average BMI</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.averageBMI}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Age Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>
            <div className="h-64">
              <Pie data={getAgeDistributionData()} options={pieOptions} />
            </div>
          </div>

          {/* BMI Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">BMI Categories</h3>
            <div className="h-64">
              <Pie data={getBMIDistributionData()} options={pieOptions} />
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Registration Trends</h3>
          <div className="h-64">
            <Line data={getMonthlyTrendsData()} options={chartOptions} />
          </div>
        </div>

        {/* Representative Performance */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Field Representative Performance</h3>
          <div className="h-64">
            <Bar data={getRepresentativePerformanceData()} options={chartOptions} />
          </div>
        </div>

        {/* Health Insights */}
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-800">Malnutrition Alert</h4>
              <p className="text-sm text-red-600 mt-1">
                {((data.stats.malnutritionCases / data.stats.totalChildren) * 100).toFixed(1)}% of children show signs of malnutrition
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800">BMI Concerns</h4>
              <p className="text-sm text-yellow-600 mt-1">
                Monitor children with BMI outside normal range for targeted interventions
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800">Data Collection</h4>
              <p className="text-sm text-green-600 mt-1">
                Consistent data collection across {new Set(data.records.map(r => r.representativeId)).size} field representatives
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
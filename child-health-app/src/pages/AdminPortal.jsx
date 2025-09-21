import React from 'react';import React from 'react';import React from 'react';import React from 'react';import React from 'react';

import { 

  Search, import { 

  Filter, 

  Download,   Search, import { 

  Users, 

  TrendingUp,   Filter, 

  BarChart3, 

  Eye,  Download,   Search, import { import { 

  FileText,

  Activity,  Users, 

  AlertTriangle,

  CheckCircle,  TrendingUp,   Filter, 

  Clock

} from 'lucide-react';  BarChart3, 

import childHealthDB from '../services/indexedDB';

import RecordDetailsModal from '../components/RecordDetailsModal';  Eye,  Download,   Search,   Search, 

import pdfService from '../services/pdfService';

import notificationService from '../services/notificationService';  FileText,



const AdminPortal = () => {  Activity,  Users, 

  const [records, setRecords] = React.useState([]);

  const [loading, setLoading] = React.useState(true);  AlertTriangle,

  const [filters, setFilters] = React.useState({

    search: '',  CheckCircle,  TrendingUp,   Filter,   Filter, 

    dateFrom: '',

    dateTo: '',  Clock

    uploaded: '',

    representative: ''} from 'lucide-react';  BarChart3, 

  });

  const [selectedRecord, setSelectedRecord] = React.useState(null);import childHealthDB from '../services/indexedDB';

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const [activeTab, setActiveTab] = React.useState('overview');import RecordDetailsModal from '../components/RecordDetailsModal';  Eye,  Download,   Download, 

  const [stats, setStats] = React.useState({

    totalRecords: 0,import pdfService from '../services/pdfService';

    uploadedRecords: 0,

    pendingRecords: 0,import notificationService from '../services/notificationService';  FileText,

    representatives: new Set(),

    averageBMI: 0,

    underweightCount: 0,

    normalWeightCount: 0,const AdminPortal = () => {  Activity,  Users,   Users, 

    overweightCount: 0,

    malnutritionCases: 0,  const [records, setRecords] = React.useState([]);

    recentIllnessCases: 0

  });  const [loading, setLoading] = React.useState(true);  AlertTriangle,



  React.useEffect(() => {  const [filters, setFilters] = React.useState({

    loadRecords();

  }, []);    search: '',  CheckCircle,  TrendingUp,   TrendingUp, 



  React.useEffect(() => {    dateFrom: '',

    calculateStats();

  }, [records]);    dateTo: '',  Clock



  const loadRecords = async () => {    uploaded: '',

    setLoading(true);

    try {    representative: ''} from 'lucide-react';  BarChart3,   Calendar, 

      await childHealthDB.ensureDB();

      const allRecords = await childHealthDB.getAllChildRecords();  });

      setRecords(allRecords);

    } catch (error) {  const [selectedRecord, setSelectedRecord] = React.useState(null);import childHealthDB from '../services/indexedDB';

      console.error('Failed to load records:', error);

      notificationService.error('Failed to load records');  const [isModalOpen, setIsModalOpen] = React.useState(false);

    } finally {

      setLoading(false);  const [activeTab, setActiveTab] = React.useState('overview');import RecordDetailsModal from '../components/RecordDetailsModal';  Eye,  MapPin, 

    }

  };  const [stats, setStats] = React.useState({



  const calculateStats = () => {    totalRecords: 0,import pdfService from '../services/pdfService';

    if (records.length === 0) return;

    uploadedRecords: 0,

    const representatives = new Set(records.map(r => r.representativeId).filter(Boolean));

    let totalBMI = 0;    pendingRecords: 0,import notificationService from '../services/notificationService';  FileText,  BarChart3, 

    let bmiCount = 0;

    let underweight = 0;    representatives: new Set(),

    let normal = 0;

    let overweight = 0;    averageBMI: 0,

    let malnutrition = 0;

    let recentIllness = 0;    underweightCount: 0,



    records.forEach(record => {    normalWeightCount: 0,const AdminPortal = () => {  Activity,  Eye,

      if (record.weight && record.height) {

        const heightInM = record.height / 100;    overweightCount: 0,

        const bmi = record.weight / (heightInM * heightInM);

        totalBMI += bmi;    malnutritionCases: 0,  const [records, setRecords] = React.useState([]);

        bmiCount++;

    recentIllnessCases: 0

        if (bmi < 18.5) underweight++;

        else if (bmi < 25) normal++;  });  const [loading, setLoading] = React.useState(true);  AlertTriangle,  FileText,

        else overweight++;

      }



      if (record.malnutritionSigns && record.malnutritionSigns !== 'N/A' && record.malnutritionSigns.trim() !== '') {  React.useEffect(() => {  const [filters, setFilters] = React.useState({

        malnutrition++;

      }    loadRecords();

      if (record.recentIllnesses && record.recentIllnesses !== 'N/A' && record.recentIllnesses.trim() !== '') {

        recentIllness++;  }, []);    search: '',  CheckCircle,  Activity,

      }

    });



    setStats({  React.useEffect(() => {    dateFrom: '',

      totalRecords: records.length,

      uploadedRecords: records.filter(r => r.uploaded).length,    calculateStats();

      pendingRecords: records.filter(r => !r.uploaded).length,

      representatives,  }, [records]);    dateTo: '',  Clock  AlertTriangle,

      averageBMI: bmiCount > 0 ? (totalBMI / bmiCount).toFixed(1) : 0,

      underweightCount: underweight,

      normalWeightCount: normal,

      overweightCount: overweight,  const loadRecords = async () => {    uploaded: '',

      malnutritionCases: malnutrition,

      recentIllnessCases: recentIllness    setLoading(true);

    });

  };    try {    representative: ''} from 'lucide-react';  CheckCircle,



  const filteredRecords = records.filter(record => {      await childHealthDB.ensureDB();

    let matches = true;

          const allRecords = await childHealthDB.getAllChildRecords();  });

    if (filters.search) {

      const searchLower = filters.search.toLowerCase();      setRecords(allRecords);

      matches = matches && (

        record.childName.toLowerCase().includes(searchLower) ||    } catch (error) {  const [selectedRecord, setSelectedRecord] = React.useState(null);import childHealthDB from '../services/indexedDB';  Clock,

        record.parentName.toLowerCase().includes(searchLower) ||

        record.healthId.toLowerCase().includes(searchLower)      console.error('Failed to load records:', error);

      );

    }      notificationService.error('Failed to load records');  const [isModalOpen, setIsModalOpen] = React.useState(false);

    

    if (filters.dateFrom) {    } finally {

      matches = matches && new Date(record.timestamp) >= new Date(filters.dateFrom);

    }      setLoading(false);  const [activeTab, setActiveTab] = React.useState('overview');import RecordDetailsModal from '../components/RecordDetailsModal';  Globe

    

    if (filters.dateTo) {    }

      matches = matches && new Date(record.timestamp) <= new Date(filters.dateTo);

    }  };  const [stats, setStats] = React.useState({

    

    if (filters.uploaded !== '') {

      matches = matches && (record.uploaded === (filters.uploaded === 'true'));

    }  const calculateStats = () => {    totalRecords: 0,import pdfService from '../services/pdfService';} from 'lucide-react';

    

    if (filters.representative) {    if (records.length === 0) return;

      matches = matches && record.representativeId === filters.representative;

    }    uploadedRecords: 0,

    

    return matches;    const representatives = new Set(records.map(r => r.representativeId).filter(Boolean));

  });

    let totalBMI = 0;    pendingRecords: 0,import notificationService from '../services/notificationService';import childHealthDB from '../services/indexedDB';

  const handleViewDetails = (record) => {

    setSelectedRecord(record);    let bmiCount = 0;

    setIsModalOpen(true);

  };    let underweight = 0;    representatives: new Set(),



  const handleCloseModal = () => {    let normal = 0;

    setIsModalOpen(false);

    setSelectedRecord(null);    let overweight = 0;    averageBMI: 0,import RecordDetailsModal from '../components/RecordDetailsModal';

  };

    let malnutrition = 0;

  const handleDownloadSummary = async () => {

    try {    let recentIllness = 0;    underweightCount: 0,

      const loadingToast = notificationService.loading('Generating summary report...');

      const pdfBlob = await pdfService.generateSummaryReport(filteredRecords);

      notificationService.dismiss(loadingToast);

          records.forEach(record => {    normalWeightCount: 0,const AdminPortal = () => {import pdfService from '../services/pdfService';

      const url = window.URL.createObjectURL(pdfBlob);

      const link = document.createElement('a');      if (record.weight && record.height) {

      link.href = url;

      link.download = `child-health-summary-${new Date().toISOString().split('T')[0]}.pdf`;        const heightInM = record.height / 100;    overweightCount: 0,

      document.body.appendChild(link);

      link.click();        const bmi = record.weight / (heightInM * heightInM);

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);        totalBMI += bmi;    malnutritionCases: 0,  const [records, setRecords] = React.useState([]);import notificationService from '../services/notificationService';

      

      notificationService.success('Summary report downloaded successfully!');        bmiCount++;

    } catch (error) {

      console.error('PDF generation failed:', error);    recentIllnessCases: 0

      notificationService.error('Failed to generate summary report.');

    }        if (bmi < 18.5) underweight++;

  };

        else if (bmi < 25) normal++;  });  const [loading, setLoading] = React.useState(true);

  const formatDate = (dateString) => {

    return new Date(dateString).toLocaleDateString('en-US', {        else overweight++;

      year: 'numeric',

      month: 'short',      }

      day: 'numeric',

      hour: '2-digit',

      minute: '2-digit',

    });      if (record.malnutritionSigns && record.malnutritionSigns !== 'N/A' && record.malnutritionSigns.trim() !== '') {  React.useEffect(() => {  const [filters, setFilters] = React.useState({const AdminPortal = () => {

  };

        malnutrition++;

  const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle = null }) => (

    <div className="bg-white rounded-lg shadow p-6">      }    loadRecords();

      <div className="flex items-center justify-between">

        <div>      if (record.recentIllnesses && record.recentIllnesses !== 'N/A' && record.recentIllnesses.trim() !== '') {

          <p className="text-sm font-medium text-gray-600">{title}</p>

          <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>        recentIllness++;  }, []);    search: '',  const [records, setRecords] = React.useState([]);

          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}

        </div>      }

        <div className={`p-3 bg-${color}-100 rounded-full`}>

          <Icon className={`h-8 w-8 text-${color}-600`} />    });

        </div>

      </div>

    </div>

  );    setStats({  React.useEffect(() => {    dateFrom: '',  const [loading, setLoading] = React.useState(true);



  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (      totalRecords: records.length,

    <button

      onClick={() => onClick(id)}      uploadedRecords: records.filter(r => r.uploaded).length,    calculateStats();

      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${

        active       pendingRecords: records.filter(r => !r.uploaded).length,

          ? 'bg-primary-100 text-primary-700 border border-primary-200' 

          : 'text-gray-600 hover:bg-gray-100'      representatives,  }, [records]);    dateTo: '',  const [filters, setFilters] = React.useState({

      }`}

    >      averageBMI: bmiCount > 0 ? (totalBMI / bmiCount).toFixed(1) : 0,

      <Icon className="h-4 w-4" />

      <span>{label}</span>      underweightCount: underweight,

    </button>

  );      normalWeightCount: normal,



  if (loading) {      overweightCount: overweight,  const loadRecords = async () => {    uploaded: '',    search: '',

    return (

      <div className="flex items-center justify-center min-h-screen">      malnutritionCases: malnutrition,

        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>

      </div>      recentIllnessCases: recentIllness    setLoading(true);

    );

  }    });



  return (  };    try {    representative: ''    dateFrom: '',

    <div className="space-y-8">

      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white">

        <div className="flex items-center justify-between">

          <div>  const filteredRecords = records.filter(record => {      await childHealthDB.ensureDB();

            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            <p className="text-primary-100 mt-2">Child Health Record Management System</p>    let matches = true;

          </div>

          <div className="text-right">          const allRecords = await childHealthDB.getAllChildRecords();  });    dateTo: '',

            <p className="text-primary-100">Total Records</p>

            <p className="text-4xl font-bold">{stats.totalRecords}</p>    if (filters.search) {

          </div>

        </div>      const searchLower = filters.search.toLowerCase();      setRecords(allRecords);

      </div>

      matches = matches && (

      <div className="flex space-x-4 border-b border-gray-200 pb-4">

        <TabButton         record.childName.toLowerCase().includes(searchLower) ||    } catch (error) {  const [selectedRecord, setSelectedRecord] = React.useState(null);    uploaded: '',

          id="overview" 

          label="Overview"         record.parentName.toLowerCase().includes(searchLower) ||

          icon={BarChart3} 

          active={activeTab === 'overview'}         record.healthId.toLowerCase().includes(searchLower)      console.error('Failed to load records:', error);

          onClick={setActiveTab} 

        />      );

        <TabButton 

          id="records"     }      notificationService.error('Failed to load records');  const [isModalOpen, setIsModalOpen] = React.useState(false);    representative: ''

          label="Records" 

          icon={FileText}     

          active={activeTab === 'records'} 

          onClick={setActiveTab}     if (filters.dateFrom) {    } finally {

        />

        <TabButton       matches = matches && new Date(record.timestamp) >= new Date(filters.dateFrom);

          id="analytics" 

          label="Analytics"     }      setLoading(false);  const [activeTab, setActiveTab] = React.useState('overview');  });

          icon={TrendingUp} 

          active={activeTab === 'analytics'}     

          onClick={setActiveTab} 

        />    if (filters.dateTo) {    }

      </div>

      matches = matches && new Date(record.timestamp) <= new Date(filters.dateTo);

      {activeTab === 'overview' && (

        <div className="space-y-8">    }  };  const [stats, setStats] = React.useState({  const [selectedRecord, setSelectedRecord] = React.useState(null);

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <StatCard     

              title="Total Records" 

              value={stats.totalRecords}     if (filters.uploaded !== '') {

              icon={FileText} 

              color="blue"       matches = matches && (record.uploaded === (filters.uploaded === 'true'));

            />

            <StatCard     }  const calculateStats = () => {    totalRecords: 0,  const [isModalOpen, setIsModalOpen] = React.useState(false);

              title="Uploaded" 

              value={stats.uploadedRecords}     

              icon={CheckCircle} 

              color="green"     if (filters.representative) {    if (records.length === 0) return;

              subtitle={`${((stats.uploadedRecords / stats.totalRecords) * 100 || 0).toFixed(1)}% of total`}

            />      matches = matches && record.representativeId === filters.representative;

            <StatCard 

              title="Pending Sync"     }    uploadedRecords: 0,  const [activeTab, setActiveTab] = React.useState('overview');

              value={stats.pendingRecords} 

              icon={Clock}     

              color="yellow" 

              subtitle={`${((stats.pendingRecords / stats.totalRecords) * 100 || 0).toFixed(1)}% of total`}    return matches;    const representatives = new Set(records.map(r => r.representativeId).filter(Boolean));

            />

            <StatCard   });

              title="Field Representatives" 

              value={stats.representatives.size}     let totalBMI = 0;    pendingRecords: 0,  const [stats, setStats] = React.useState({

              icon={Users} 

              color="purple"   const handleViewDetails = (record) => {

            />

          </div>    setSelectedRecord(record);    let bmiCount = 0;



          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">    setIsModalOpen(true);

            <div className="bg-white rounded-lg shadow p-6">

              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">  };    let underweight = 0;    representatives: new Set(),    totalRecords: 0,

                <Activity className="h-5 w-5 mr-2 text-green-600" />

                BMI Distribution

              </h3>

              <div className="space-y-4">  const handleCloseModal = () => {    let normal = 0;

                <div className="flex items-center justify-between">

                  <span className="text-sm text-gray-600">Average BMI</span>    setIsModalOpen(false);

                  <span className="font-semibold text-lg">{stats.averageBMI} kg/m²</span>

                </div>    setSelectedRecord(null);    let overweight = 0;    averageBMI: 0,    uploadedRecords: 0,

                <div className="space-y-2">

                  <div className="flex justify-between items-center">  };

                    <span className="text-sm text-red-600">Underweight</span>

                    <span className="font-medium">{stats.underweightCount}</span>    let malnutrition = 0;

                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">  const handleDownloadSummary = async () => {

                    <div 

                      className="bg-red-500 h-2 rounded-full"     try {    let recentIllness = 0;    underweightCount: 0,    pendingRecords: 0,

                      style={{ width: `${(stats.underweightCount / stats.totalRecords) * 100}%` }}

                    ></div>      const loadingToast = notificationService.loading('Generating summary report...');

                  </div>

                </div>      const pdfBlob = await pdfService.generateSummaryReport(filteredRecords);

                <div className="space-y-2">

                  <div className="flex justify-between items-center">      notificationService.dismiss(loadingToast);

                    <span className="text-sm text-green-600">Normal Weight</span>

                    <span className="font-medium">{stats.normalWeightCount}</span>          records.forEach(record => {    normalWeightCount: 0,    representatives: new Set(),

                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">      const url = window.URL.createObjectURL(pdfBlob);

                    <div 

                      className="bg-green-500 h-2 rounded-full"       const link = document.createElement('a');      // BMI calculations

                      style={{ width: `${(stats.normalWeightCount / stats.totalRecords) * 100}%` }}

                    ></div>      link.href = url;

                  </div>

                </div>      link.download = `child-health-summary-${new Date().toISOString().split('T')[0]}.pdf`;      if (record.weight && record.height) {    overweightCount: 0,    averageBMI: 0,

                <div className="space-y-2">

                  <div className="flex justify-between items-center">      document.body.appendChild(link);

                    <span className="text-sm text-orange-600">Overweight</span>

                    <span className="font-medium">{stats.overweightCount}</span>      link.click();        const heightInM = record.height / 100;

                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">      document.body.removeChild(link);

                    <div 

                      className="bg-orange-500 h-2 rounded-full"       window.URL.revokeObjectURL(url);        const bmi = record.weight / (heightInM * heightInM);    malnutritionCases: 0,    underweightCount: 0,

                      style={{ width: `${(stats.overweightCount / stats.totalRecords) * 100}%` }}

                    ></div>      

                  </div>

                </div>      notificationService.success('Summary report downloaded successfully!');        totalBMI += bmi;

              </div>

            </div>    } catch (error) {



            <div className="bg-white rounded-lg shadow p-6">      console.error('PDF generation failed:', error);        bmiCount++;    recentIllnessCases: 0    normalWeightCount: 0,

              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">

                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />      notificationService.error('Failed to generate summary report.');

                Health Alerts

              </h3>    }

              <div className="space-y-4">

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">  };

                  <div className="flex items-center justify-between">

                    <span className="text-sm font-medium text-red-800">Malnutrition Cases</span>        if (bmi < 18.5) underweight++;  });    overweightCount: 0,

                    <span className="text-xl font-bold text-red-900">{stats.malnutritionCases}</span>

                  </div>  const formatDate = (dateString) => {

                  <p className="text-xs text-red-600 mt-1">

                    {((stats.malnutritionCases / stats.totalRecords) * 100 || 0).toFixed(1)}% of total records    return new Date(dateString).toLocaleDateString('en-US', {        else if (bmi < 25) normal++;

                  </p>

                </div>      year: 'numeric',

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">

                  <div className="flex items-center justify-between">      month: 'short',        else overweight++;    malnutritionCases: 0,

                    <span className="text-sm font-medium text-yellow-800">Recent Illness Cases</span>

                    <span className="text-xl font-bold text-yellow-900">{stats.recentIllnessCases}</span>      day: 'numeric',

                  </div>

                  <p className="text-xs text-yellow-600 mt-1">      hour: '2-digit',      }

                    {((stats.recentIllnessCases / stats.totalRecords) * 100 || 0).toFixed(1)}% of total records

                  </p>      minute: '2-digit',

                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">    });  React.useEffect(() => {    recentIllnessCases: 0

                  <div className="flex items-center justify-between">

                    <span className="text-sm font-medium text-blue-800">Underweight Children</span>  };

                    <span className="text-xl font-bold text-blue-900">{stats.underweightCount}</span>

                  </div>      // Health conditions

                  <p className="text-xs text-blue-600 mt-1">

                    Requires nutritional intervention  const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle = null }) => (

                  </p>

                </div>    <div className="bg-white rounded-lg shadow p-6">      if (record.malnutritionSigns && record.malnutritionSigns !== 'N/A' && record.malnutritionSigns.trim() !== '') {    loadRecords();  });

              </div>

            </div>      <div className="flex items-center justify-between">

          </div>

        </div>        <div>        malnutrition++;

      )}

          <p className="text-sm font-medium text-gray-600">{title}</p>

      {activeTab === 'records' && (

        <div className="space-y-6">          <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>      }  }, []);

          <div className="bg-white rounded-lg shadow p-6">

            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}

              <Filter className="h-5 w-5 mr-2" />

              Filters        </div>      if (record.recentIllnesses && record.recentIllnesses !== 'N/A' && record.recentIllnesses.trim() !== '') {

            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">        <div className={`p-3 bg-${color}-100 rounded-full`}>

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>          <Icon className={`h-8 w-8 text-${color}-600`} />        recentIllness++;  React.useEffect(() => {

                <div className="relative">

                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />        </div>

                  <input

                    type="text"      </div>      }

                    value={filters.search}

                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}    </div>

                    className="pl-10 form-input"

                    placeholder="Name or Health ID"  );    });  React.useEffect(() => {    loadRecords();

                  />

                </div>

              </div>

              <div>  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (

                <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>

                <input    <button

                  type="date"

                  value={filters.dateFrom}      onClick={() => onClick(id)}    setStats({    calculateStats();  }, []);

                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}

                  className="form-input"      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${

                />

              </div>        active       totalRecords: records.length,

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>          ? 'bg-primary-100 text-primary-700 border border-primary-200' 

                <input

                  type="date"          : 'text-gray-600 hover:bg-gray-100'      uploadedRecords: records.filter(r => r.uploaded).length,  }, [records]);

                  value={filters.dateTo}

                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}      }`}

                  className="form-input"

                />    >      pendingRecords: records.filter(r => !r.uploaded).length,

              </div>

              <div>      <Icon className="h-4 w-4" />

                <label className="block text-sm font-medium text-gray-700 mb-1">Sync Status</label>

                <select      <span>{label}</span>      representatives,  React.useEffect(() => {

                  value={filters.uploaded}

                  onChange={(e) => setFilters(prev => ({ ...prev, uploaded: e.target.value }))}    </button>

                  className="form-input"

                >  );      averageBMI: bmiCount > 0 ? (totalBMI / bmiCount).toFixed(1) : 0,

                  <option value="">All</option>

                  <option value="true">Uploaded</option>

                  <option value="false">Pending</option>

                </select>  if (loading) {      underweightCount: underweight,  const loadRecords = async () => {    calculateStats();

              </div>

              <div className="flex items-end">    return (

                <button

                  onClick={handleDownloadSummary}      <div className="flex items-center justify-center min-h-screen">      normalWeightCount: normal,

                  className="w-full btn-primary flex items-center justify-center space-x-2"

                >        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>

                  <Download className="h-4 w-4" />

                  <span>Export PDF</span>      </div>      overweightCount: overweight,    setLoading(true);  }, [records]);

                </button>

              </div>    );

            </div>

          </div>  }      malnutritionCases: malnutrition,



          <div className="bg-white rounded-lg shadow overflow-hidden">

            <div className="overflow-x-auto">

              <table className="min-w-full divide-y divide-gray-200">  return (      recentIllnessCases: recentIllness    try {

                <thead className="bg-gray-50">

                  <tr>    <div className="space-y-8">

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                      Child Information      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white">    });

                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">        <div className="flex items-center justify-between">

                      Measurements

                    </th>          <div>  };      await childHealthDB.ensureDB();  const loadRecords = async () => {

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                      Date            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">            <p className="text-primary-100 mt-2">Child Health Record Management System</p>

                      Status

                    </th>          </div>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                      Actions          <div className="text-right">  const filteredRecords = records.filter(record => {      const allRecords = await childHealthDB.getAllChildRecords();    setLoading(true);

                    </th>

                  </tr>            <p className="text-primary-100">Total Records</p>

                </thead>

                <tbody className="bg-white divide-y divide-gray-200">            <p className="text-4xl font-bold">{stats.totalRecords}</p>    let matches = true;

                  {filteredRecords.map((record) => {

                    const bmi = record.weight && record.height           </div>

                      ? (record.weight / Math.pow(record.height / 100, 2)).toFixed(1)

                      : 'N/A';        </div>          setRecords(allRecords);    try {

                    

                    return (      </div>

                      <tr key={record.id} className="hover:bg-gray-50">

                        <td className="px-6 py-4">    if (filters.search) {

                          <div>

                            <div className="text-sm font-medium text-gray-900">{record.childName}</div>      <div className="flex space-x-4 border-b border-gray-200 pb-4">

                            <div className="text-sm text-gray-500">ID: {record.healthId}</div>

                            <div className="text-sm text-gray-500">Age: {record.age} years</div>        <TabButton       const searchLower = filters.search.toLowerCase();    } catch (error) {      await childHealthDB.ensureDB();

                          </div>

                        </td>          id="overview" 

                        <td className="px-6 py-4">

                          <div className="text-sm text-gray-900">          label="Overview"       matches = matches && (

                            {record.weight}kg / {record.height}cm

                          </div>          icon={BarChart3} 

                          <div className="text-sm text-gray-500">BMI: {bmi}</div>

                        </td>          active={activeTab === 'overview'}         record.childName.toLowerCase().includes(searchLower) ||      console.error('Failed to load records:', error);      const allRecords = await childHealthDB.getAllChildRecords();

                        <td className="px-6 py-4 text-sm text-gray-500">

                          {formatDate(record.timestamp)}          onClick={setActiveTab} 

                        </td>

                        <td className="px-6 py-4">        />        record.parentName.toLowerCase().includes(searchLower) ||

                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${

                            record.uploaded         <TabButton 

                              ? 'bg-green-100 text-green-800' 

                              : 'bg-yellow-100 text-yellow-800'          id="records"         record.healthId.toLowerCase().includes(searchLower)      notificationService.error('Failed to load records');      setRecords(allRecords);

                          }`}>

                            {record.uploaded ? 'Uploaded' : 'Pending'}          label="Records" 

                          </span>

                        </td>          icon={FileText}       );

                        <td className="px-6 py-4 text-sm font-medium">

                          <button          active={activeTab === 'records'} 

                            onClick={() => handleViewDetails(record)}

                            className="text-primary-600 hover:text-primary-900"          onClick={setActiveTab}     }    } finally {    } catch (error) {

                          >

                            <Eye className="h-4 w-4" />        />

                          </button>

                        </td>        <TabButton     

                      </tr>

                    );          id="analytics" 

                  })}

                </tbody>          label="Analytics"     if (filters.dateFrom) {      setLoading(false);      console.error('Failed to load records:', error);

              </table>

            </div>          icon={TrendingUp} 

            

            {filteredRecords.length === 0 && (          active={activeTab === 'analytics'}       matches = matches && new Date(record.timestamp) >= new Date(filters.dateFrom);

              <div className="text-center py-12">

                <FileText className="mx-auto h-12 w-12 text-gray-400" />          onClick={setActiveTab} 

                <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>

                <p className="mt-1 text-sm text-gray-500">Try adjusting your filters</p>        />    }    }      notificationService.error('Failed to load records');

              </div>

            )}      </div>

          </div>

        </div>    

      )}

      {activeTab === 'overview' && (

      {activeTab === 'analytics' && (

        <div className="space-y-6">        <div className="space-y-8">    if (filters.dateTo) {  };    } finally {

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="bg-white rounded-lg shadow p-6">          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>

              <div className="space-y-3">            <StatCard       matches = matches && new Date(record.timestamp) <= new Date(filters.dateTo);

                {[0, 2, 5, 10, 15].map((minAge, index, arr) => {

                  const maxAge = arr[index + 1] || 18;              title="Total Records" 

                  const count = records.filter(r => r.age >= minAge && r.age < maxAge).length;

                  const percentage = (count / records.length) * 100 || 0;              value={stats.totalRecords}     }      setLoading(false);

                  

                  return (              icon={FileText} 

                    <div key={minAge} className="flex items-center justify-between">

                      <span className="text-sm text-gray-600">              color="blue"     

                        {minAge === 15 ? '15-18 years' : `${minAge}-${maxAge - 1} years`}

                      </span>            />

                      <div className="flex items-center space-x-2">

                        <div className="w-32 bg-gray-200 rounded-full h-2">            <StatCard     if (filters.uploaded !== '') {  const calculateStats = () => {    }

                          <div 

                            className="bg-primary-500 h-2 rounded-full"               title="Uploaded" 

                            style={{ width: `${percentage}%` }}

                          ></div>              value={stats.uploadedRecords}       matches = matches && (record.uploaded === (filters.uploaded === 'true'));

                        </div>

                        <span className="text-sm font-medium w-12 text-right">{count}</span>              icon={CheckCircle} 

                      </div>

                    </div>              color="green"     }    if (records.length === 0) return;  };

                  );

                })}              subtitle={`${((stats.uploadedRecords / stats.totalRecords) * 100 || 0).toFixed(1)}% of total`}

              </div>

            </div>            />    



            <div className="bg-white rounded-lg shadow p-6">            <StatCard 

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Representative Performance</h3>

              <div className="space-y-3">              title="Pending Sync"     if (filters.representative) {

                {Array.from(stats.representatives).map((repId) => {

                  const repRecords = records.filter(r => r.representativeId === repId);              value={stats.pendingRecords} 

                  const uploaded = repRecords.filter(r => r.uploaded).length;

                                icon={Clock}       matches = matches && record.representativeId === filters.representative;

                  return (

                    <div key={repId} className="flex items-center justify-between">              color="yellow" 

                      <span className="text-sm text-gray-600 truncate">{repId}</span>

                      <div className="flex items-center space-x-2">              subtitle={`${((stats.pendingRecords / stats.totalRecords) * 100 || 0).toFixed(1)}% of total`}    }    const representatives = new Set(records.map(r => r.representativeId).filter(Boolean));  const calculateStats = () => {

                        <span className="text-sm text-gray-500">{uploaded}/{repRecords.length}</span>

                        <div className="w-24 bg-gray-200 rounded-full h-2">            />

                          <div 

                            className="bg-green-500 h-2 rounded-full"             <StatCard     

                            style={{ width: `${(uploaded / repRecords.length) * 100}%` }}

                          ></div>              title="Field Representatives" 

                        </div>

                      </div>              value={stats.representatives.size}     return matches;    let totalBMI = 0;    if (records.length === 0) return;

                    </div>

                  );              icon={Users} 

                })}

              </div>              color="purple"   });

            </div>

          </div>            />

        </div>

      )}          </div>    let bmiCount = 0;



      <RecordDetailsModal

        record={selectedRecord}

        isOpen={isModalOpen}          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">  const handleViewDetails = (record) => {

        onClose={handleCloseModal}

      />            <div className="bg-white rounded-lg shadow p-6">

    </div>

  );              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">    setSelectedRecord(record);    let underweight = 0;    const representatives = new Set(records.map(r => r.representativeId).filter(Boolean));

};

                <Activity className="h-5 w-5 mr-2 text-green-600" />

export default AdminPortal;
                BMI Distribution    setIsModalOpen(true);

              </h3>

              <div className="space-y-4">  };    let normal = 0;    let totalBMI = 0;

                <div className="flex items-center justify-between">

                  <span className="text-sm text-gray-600">Average BMI</span>

                  <span className="font-semibold text-lg">{stats.averageBMI} kg/m²</span>

                </div>  const handleCloseModal = () => {    let overweight = 0;    let bmiCount = 0;

                <div className="space-y-2">

                  <div className="flex justify-between items-center">    setIsModalOpen(false);

                    <span className="text-sm text-red-600">Underweight</span>

                    <span className="font-medium">{stats.underweightCount}</span>    setSelectedRecord(null);    let malnutrition = 0;    let underweight = 0;

                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">  };

                    <div 

                      className="bg-red-500 h-2 rounded-full"     let recentIllness = 0;    let normal = 0;

                      style={{ width: `${(stats.underweightCount / stats.totalRecords) * 100}%` }}

                    ></div>  const handleDownloadSummary = async () => {

                  </div>

                </div>    try {    let overweight = 0;

                <div className="space-y-2">

                  <div className="flex justify-between items-center">      const loadingToast = notificationService.loading('Generating summary report...');

                    <span className="text-sm text-green-600">Normal Weight</span>

                    <span className="font-medium">{stats.normalWeightCount}</span>      const pdfBlob = await pdfService.generateSummaryReport(filteredRecords);    records.forEach(record => {    let malnutrition = 0;

                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">      notificationService.dismiss(loadingToast);

                    <div 

                      className="bg-green-500 h-2 rounded-full"             // BMI calculations    let recentIllness = 0;

                      style={{ width: `${(stats.normalWeightCount / stats.totalRecords) * 100}%` }}

                    ></div>      const url = window.URL.createObjectURL(pdfBlob);

                  </div>

                </div>      const link = document.createElement('a');      if (record.weight && record.height) {

                <div className="space-y-2">

                  <div className="flex justify-between items-center">      link.href = url;

                    <span className="text-sm text-orange-600">Overweight</span>

                    <span className="font-medium">{stats.overweightCount}</span>      link.download = `child-health-summary-${new Date().toISOString().split('T')[0]}.pdf`;        const heightInM = record.height / 100;    records.forEach(record => {

                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">      document.body.appendChild(link);

                    <div 

                      className="bg-orange-500 h-2 rounded-full"       link.click();        const bmi = record.weight / (heightInM * heightInM);      // BMI calculations

                      style={{ width: `${(stats.overweightCount / stats.totalRecords) * 100}%` }}

                    ></div>      document.body.removeChild(link);

                  </div>

                </div>      window.URL.revokeObjectURL(url);        totalBMI += bmi;      if (record.weight && record.height) {

              </div>

            </div>      



            <div className="bg-white rounded-lg shadow p-6">      notificationService.success('Summary report downloaded successfully!');        bmiCount++;        const heightInM = record.height / 100;

              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">

                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />    } catch (error) {

                Health Alerts

              </h3>      console.error('PDF generation failed:', error);        const bmi = record.weight / (heightInM * heightInM);

              <div className="space-y-4">

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">      notificationService.error('Failed to generate summary report.');

                  <div className="flex items-center justify-between">

                    <span className="text-sm font-medium text-red-800">Malnutrition Cases</span>    }        if (bmi < 18.5) underweight++;        totalBMI += bmi;

                    <span className="text-xl font-bold text-red-900">{stats.malnutritionCases}</span>

                  </div>  };

                  <p className="text-xs text-red-600 mt-1">

                    {((stats.malnutritionCases / stats.totalRecords) * 100 || 0).toFixed(1)}% of total records        else if (bmi < 25) normal++;        bmiCount++;

                  </p>

                </div>  const formatDate = (dateString) => {

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">

                  <div className="flex items-center justify-between">    return new Date(dateString).toLocaleDateString('en-US', {        else overweight++;

                    <span className="text-sm font-medium text-yellow-800">Recent Illness Cases</span>

                    <span className="text-xl font-bold text-yellow-900">{stats.recentIllnessCases}</span>      year: 'numeric',

                  </div>

                  <p className="text-xs text-yellow-600 mt-1">      month: 'short',      }        if (bmi < 18.5) underweight++;

                    {((stats.recentIllnessCases / stats.totalRecords) * 100 || 0).toFixed(1)}% of total records

                  </p>      day: 'numeric',

                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">      hour: '2-digit',        else if (bmi < 25) normal++;

                  <div className="flex items-center justify-between">

                    <span className="text-sm font-medium text-blue-800">Underweight Children</span>      minute: '2-digit',

                    <span className="text-xl font-bold text-blue-900">{stats.underweightCount}</span>

                  </div>    });      // Health conditions        else overweight++;

                  <p className="text-xs text-blue-600 mt-1">

                    Requires nutritional intervention  };

                  </p>

                </div>      if (record.malnutritionSigns && record.malnutritionSigns !== 'N/A' && record.malnutritionSigns.trim() !== '') {      }

              </div>

            </div>  const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle = null }) => (

          </div>

        </div>    <div className="bg-white rounded-lg shadow p-6">        malnutrition++;

      )}

      <div className="flex items-center justify-between">

      {activeTab === 'records' && (

        <div className="space-y-6">        <div>      }      // Health conditions

          <div className="bg-white rounded-lg shadow p-6">

            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">          <p className="text-sm font-medium text-gray-600">{title}</p>

              <Filter className="h-5 w-5 mr-2" />

              Filters          <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>      if (record.recentIllnesses && record.recentIllnesses !== 'N/A' && record.recentIllnesses.trim() !== '') {      if (record.malnutritionSigns && record.malnutritionSigns !== 'N/A' && record.malnutritionSigns.trim() !== '') {

            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>        </div>        recentIllness++;        malnutrition++;

                <div className="relative">

                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />        <div className={`p-3 bg-${color}-100 rounded-full`}>

                  <input

                    type="text"          <Icon className={`h-8 w-8 text-${color}-600`} />      }      }

                    value={filters.search}

                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}        </div>

                    className="pl-10 form-input"

                    placeholder="Name or Health ID"      </div>    });      if (record.recentIllnesses && record.recentIllnesses !== 'N/A' && record.recentIllnesses.trim() !== '') {

                  />

                </div>    </div>

              </div>

              <div>  );        recentIllness++;

                <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>

                <input

                  type="date"

                  value={filters.dateFrom}  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (    setStats({      }

                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}

                  className="form-input"    <button

                />

              </div>      onClick={() => onClick(id)}      totalRecords: records.length,    });

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${

                <input

                  type="date"        active       uploadedRecords: records.filter(r => r.uploaded).length,

                  value={filters.dateTo}

                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}          ? 'bg-primary-100 text-primary-700 border border-primary-200' 

                  className="form-input"

                />          : 'text-gray-600 hover:bg-gray-100'      pendingRecords: records.filter(r => !r.uploaded).length,    setStats({

              </div>

              <div>      }`}

                <label className="block text-sm font-medium text-gray-700 mb-1">Sync Status</label>

                <select    >      representatives,      totalRecords: records.length,

                  value={filters.uploaded}

                  onChange={(e) => setFilters(prev => ({ ...prev, uploaded: e.target.value }))}      <Icon className="h-4 w-4" />

                  className="form-input"

                >      <span>{label}</span>      averageBMI: bmiCount > 0 ? (totalBMI / bmiCount).toFixed(1) : 0,      uploadedRecords: records.filter(r => r.uploaded).length,

                  <option value="">All</option>

                  <option value="true">Uploaded</option>    </button>

                  <option value="false">Pending</option>

                </select>  );      underweightCount: underweight,      pendingRecords: records.filter(r => !r.uploaded).length,

              </div>

              <div className="flex items-end">

                <button

                  onClick={handleDownloadSummary}  if (loading) {      normalWeightCount: normal,      representatives,

                  className="w-full btn-primary flex items-center justify-center space-x-2"

                >    return (

                  <Download className="h-4 w-4" />

                  <span>Export PDF</span>      <div className="flex items-center justify-center min-h-screen">      overweightCount: overweight,      averageBMI: bmiCount > 0 ? (totalBMI / bmiCount).toFixed(1) : 0,

                </button>

              </div>        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>

            </div>

          </div>      </div>      malnutritionCases: malnutrition,      underweightCount: underweight,



          <div className="bg-white rounded-lg shadow overflow-hidden">    );

            <div className="overflow-x-auto">

              <table className="min-w-full divide-y divide-gray-200">  }      recentIllnessCases: recentIllness      normalWeightCount: normal,

                <thead className="bg-gray-50">

                  <tr>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                      Child Information  return (    });      overweightCount: overweight,

                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">    <div className="space-y-8">

                      Measurements

                    </th>      {/* Header */}  };      malnutritionCases: malnutrition,

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                      Date      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white">

                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">        <div className="flex items-center justify-between">      recentIllnessCases: recentIllness

                      Status

                    </th>          <div>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                      Actions            <h1 className="text-3xl font-bold">Admin Dashboard</h1>  const filteredRecords = records.filter(record => {    });

                    </th>

                  </tr>            <p className="text-primary-100 mt-2">Child Health Record Management System</p>

                </thead>

                <tbody className="bg-white divide-y divide-gray-200">          </div>    let matches = true;  };

                  {filteredRecords.map((record) => {

                    const bmi = record.weight && record.height           <div className="text-right">

                      ? (record.weight / Math.pow(record.height / 100, 2)).toFixed(1)

                      : 'N/A';            <p className="text-primary-100">Total Records</p>    

                    

                    return (            <p className="text-4xl font-bold">{stats.totalRecords}</p>

                      <tr key={record.id} className="hover:bg-gray-50">

                        <td className="px-6 py-4">          </div>    if (filters.search) {  const filteredRecords = records.filter(record => {

                          <div>

                            <div className="text-sm font-medium text-gray-900">{record.childName}</div>        </div>

                            <div className="text-sm text-gray-500">ID: {record.healthId}</div>

                            <div className="text-sm text-gray-500">Age: {record.age} years</div>      </div>      const searchLower = filters.search.toLowerCase();    let matches = true;

                          </div>

                        </td>

                        <td className="px-6 py-4">

                          <div className="text-sm text-gray-900">      {/* Navigation Tabs */}      matches = matches && (    

                            {record.weight}kg / {record.height}cm

                          </div>      <div className="flex space-x-4 border-b border-gray-200 pb-4">

                          <div className="text-sm text-gray-500">BMI: {bmi}</div>

                        </td>        <TabButton         record.childName.toLowerCase().includes(searchLower) ||    if (filters.search) {

                        <td className="px-6 py-4 text-sm text-gray-500">

                          {formatDate(record.timestamp)}          id="overview" 

                        </td>

                        <td className="px-6 py-4">          label="Overview"         record.parentName.toLowerCase().includes(searchLower) ||      const searchLower = filters.search.toLowerCase();

                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${

                            record.uploaded           icon={BarChart3} 

                              ? 'bg-green-100 text-green-800' 

                              : 'bg-yellow-100 text-yellow-800'          active={activeTab === 'overview'}         record.healthId.toLowerCase().includes(searchLower)      matches = matches && (

                          }`}>

                            {record.uploaded ? 'Uploaded' : 'Pending'}          onClick={setActiveTab} 

                          </span>

                        </td>        />      );        record.childName.toLowerCase().includes(searchLower) ||

                        <td className="px-6 py-4 text-sm font-medium">

                          <button        <TabButton 

                            onClick={() => handleViewDetails(record)}

                            className="text-primary-600 hover:text-primary-900"          id="records"     }        record.parentName.toLowerCase().includes(searchLower) ||

                          >

                            <Eye className="h-4 w-4" />          label="Records" 

                          </button>

                        </td>          icon={FileText}             record.healthId.toLowerCase().includes(searchLower)

                      </tr>

                    );          active={activeTab === 'records'} 

                  })}

                </tbody>          onClick={setActiveTab}     if (filters.dateFrom) {      );

              </table>

            </div>        />

            

            {filteredRecords.length === 0 && (        <TabButton       matches = matches && new Date(record.timestamp) >= new Date(filters.dateFrom);    }

              <div className="text-center py-12">

                <FileText className="mx-auto h-12 w-12 text-gray-400" />          id="analytics" 

                <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>

                <p className="mt-1 text-sm text-gray-500">Try adjusting your filters</p>          label="Analytics"     }    

              </div>

            )}          icon={TrendingUp} 

          </div>

        </div>          active={activeTab === 'analytics'}         if (filters.dateFrom) {

      )}

          onClick={setActiveTab} 

      {activeTab === 'analytics' && (

        <div className="space-y-6">        />    if (filters.dateTo) {      matches = matches && new Date(record.timestamp) >= new Date(filters.dateFrom);

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="bg-white rounded-lg shadow p-6">      </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>

              <div className="space-y-3">      matches = matches && new Date(record.timestamp) <= new Date(filters.dateTo);    }

                {[0, 2, 5, 10, 15].map((minAge, index, arr) => {

                  const maxAge = arr[index + 1] || 18;      {/* Overview Tab */}

                  const count = records.filter(r => r.age >= minAge && r.age < maxAge).length;

                  const percentage = (count / records.length) * 100 || 0;      {activeTab === 'overview' && (    }    

                  

                  return (        <div className="space-y-8">

                    <div key={minAge} className="flex items-center justify-between">

                      <span className="text-sm text-gray-600">          {/* Stats Grid */}        if (filters.dateTo) {

                        {minAge === 15 ? '15-18 years' : `${minAge}-${maxAge - 1} years`}

                      </span>          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                      <div className="flex items-center space-x-2">

                        <div className="w-32 bg-gray-200 rounded-full h-2">            <StatCard     if (filters.uploaded !== '') {      matches = matches && new Date(record.timestamp) <= new Date(filters.dateTo);

                          <div 

                            className="bg-primary-500 h-2 rounded-full"               title="Total Records" 

                            style={{ width: `${percentage}%` }}

                          ></div>              value={stats.totalRecords}       matches = matches && (record.uploaded === (filters.uploaded === 'true'));    }

                        </div>

                        <span className="text-sm font-medium w-12 text-right">{count}</span>              icon={FileText} 

                      </div>

                    </div>              color="blue"     }    

                  );

                })}            />

              </div>

            </div>            <StatCard         if (filters.uploaded !== '') {



            <div className="bg-white rounded-lg shadow p-6">              title="Uploaded" 

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Representative Performance</h3>

              <div className="space-y-3">              value={stats.uploadedRecords}     if (filters.representative) {      matches = matches && (record.uploaded === (filters.uploaded === 'true'));

                {Array.from(stats.representatives).map((repId) => {

                  const repRecords = records.filter(r => r.representativeId === repId);              icon={CheckCircle} 

                  const uploaded = repRecords.filter(r => r.uploaded).length;

                                color="green"       matches = matches && record.representativeId === filters.representative;    }

                  return (

                    <div key={repId} className="flex items-center justify-between">              subtitle={`${((stats.uploadedRecords / stats.totalRecords) * 100 || 0).toFixed(1)}% of total`}

                      <span className="text-sm text-gray-600 truncate">{repId}</span>

                      <div className="flex items-center space-x-2">            />    }    

                        <span className="text-sm text-gray-500">{uploaded}/{repRecords.length}</span>

                        <div className="w-24 bg-gray-200 rounded-full h-2">            <StatCard 

                          <div 

                            className="bg-green-500 h-2 rounded-full"               title="Pending Sync"         if (filters.representative) {

                            style={{ width: `${(uploaded / repRecords.length) * 100}%` }}

                          ></div>              value={stats.pendingRecords} 

                        </div>

                      </div>              icon={Clock}     return matches;      matches = matches && record.representativeId === filters.representative;

                    </div>

                  );              color="yellow" 

                })}

              </div>              subtitle={`${((stats.pendingRecords / stats.totalRecords) * 100 || 0).toFixed(1)}% of total`}  });    }

            </div>

          </div>            />

        </div>

      )}            <StatCard     



      <RecordDetailsModal              title="Field Representatives" 

        record={selectedRecord}

        isOpen={isModalOpen}              value={stats.representatives.size}   const handleViewDetails = (record) => {    return matches;

        onClose={handleCloseModal}

      />              icon={Users} 

    </div>

  );              color="purple"     setSelectedRecord(record);  });

};

            />

export default AdminPortal;
          </div>    setIsModalOpen(true);



          {/* Health Metrics */}  };  const handleViewDetails = (record) => {

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* BMI Distribution */}    setSelectedRecord(record);

            <div className="bg-white rounded-lg shadow p-6">

              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">  const handleCloseModal = () => {    setIsModalOpen(true);

                <Activity className="h-5 w-5 mr-2 text-green-600" />

                BMI Distribution    setIsModalOpen(false);  };

              </h3>

              <div className="space-y-4">    setSelectedRecord(null);

                <div className="flex items-center justify-between">

                  <span className="text-sm text-gray-600">Average BMI</span>  };  const handleCloseModal = () => {

                  <span className="font-semibold text-lg">{stats.averageBMI} kg/m²</span>

                </div>    setIsModalOpen(false);

                <div className="space-y-2">

                  <div className="flex justify-between items-center">  const handleDownloadSummary = async () => {    setSelectedRecord(null);

                    <span className="text-sm text-red-600">Underweight</span>

                    <span className="font-medium">{stats.underweightCount}</span>    try {  };

                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">      const loadingToast = notificationService.loading('Generating summary report...');

                    <div 

                      className="bg-red-500 h-2 rounded-full"       const pdfBlob = await pdfService.generateSummaryReport(filteredRecords);  const handleDownloadSummary = async () => {

                      style={{ width: `${(stats.underweightCount / stats.totalRecords) * 100}%` }}

                    ></div>      notificationService.dismiss(loadingToast);    try {

                  </div>

                </div>            const loadingToast = notificationService.loading('Generating summary report...');

                <div className="space-y-2">

                  <div className="flex justify-between items-center">      const url = window.URL.createObjectURL(pdfBlob);      const pdfBlob = await pdfService.generateSummaryReport(filteredRecords);

                    <span className="text-sm text-green-600">Normal Weight</span>

                    <span className="font-medium">{stats.normalWeightCount}</span>      const link = document.createElement('a');      notificationService.dismiss(loadingToast);

                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">      link.href = url;      

                    <div 

                      className="bg-green-500 h-2 rounded-full"       link.download = `child-health-summary-${new Date().toISOString().split('T')[0]}.pdf`;      const url = window.URL.createObjectURL(pdfBlob);

                      style={{ width: `${(stats.normalWeightCount / stats.totalRecords) * 100}%` }}

                    ></div>      document.body.appendChild(link);      const link = document.createElement('a');

                  </div>

                </div>      link.click();      link.href = url;

                <div className="space-y-2">

                  <div className="flex justify-between items-center">      document.body.removeChild(link);      link.download = `child-health-summary-${new Date().toISOString().split('T')[0]}.pdf`;

                    <span className="text-sm text-orange-600">Overweight</span>

                    <span className="font-medium">{stats.overweightCount}</span>      window.URL.revokeObjectURL(url);      document.body.appendChild(link);

                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">            link.click();

                    <div 

                      className="bg-orange-500 h-2 rounded-full"       notificationService.success('Summary report downloaded successfully!');      document.body.removeChild(link);

                      style={{ width: `${(stats.overweightCount / stats.totalRecords) * 100}%` }}

                    ></div>    } catch (error) {      window.URL.revokeObjectURL(url);

                  </div>

                </div>      console.error('PDF generation failed:', error);      

              </div>

            </div>      notificationService.error('Failed to generate summary report.');      notificationService.success('Summary report downloaded successfully!');



            {/* Health Alerts */}    }    } catch (error) {

            <div className="bg-white rounded-lg shadow p-6">

              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">  };      console.error('PDF generation failed:', error);

                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />

                Health Alerts      notificationService.error('Failed to generate summary report.');

              </h3>

              <div className="space-y-4">  const formatDate = (dateString) => {    }

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">

                  <div className="flex items-center justify-between">    return new Date(dateString).toLocaleDateString('en-US', {  };

                    <span className="text-sm font-medium text-red-800">Malnutrition Cases</span>

                    <span className="text-xl font-bold text-red-900">{stats.malnutritionCases}</span>      year: 'numeric',    } catch (error) {

                  </div>

                  <p className="text-xs text-red-600 mt-1">      month: 'short',      console.error('Failed to load records:', error);

                    {((stats.malnutritionCases / stats.totalRecords) * 100 || 0).toFixed(1)}% of total records

                  </p>      day: 'numeric',      // Fallback to mock data for demo

                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">      hour: '2-digit',      setRecords([

                  <div className="flex items-center justify-between">

                    <span className="text-sm font-medium text-yellow-800">Recent Illness Cases</span>      minute: '2-digit',        {

                    <span className="text-xl font-bold text-yellow-900">{stats.recentIllnessCases}</span>

                  </div>    });          _id: '1',

                  <p className="text-xs text-yellow-600 mt-1">

                    {((stats.recentIllnessCases / stats.totalRecords) * 100 || 0).toFixed(1)}% of total records  };          healthId: 'CHR123456789',

                  </p>

                </div>          childName: 'John Doe',

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">

                  <div className="flex items-center justify-between">  const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle = null }) => (          age: 5,

                    <span className="text-sm font-medium text-blue-800">Underweight Children</span>

                    <span className="text-xl font-bold text-blue-900">{stats.underweightCount}</span>    <div className="bg-white rounded-lg shadow p-6">          weight: 18.5,

                  </div>

                  <p className="text-xs text-blue-600 mt-1">      <div className="flex items-center justify-between">          height: 110,

                    Requires nutritional intervention

                  </p>        <div>          parentName: 'Jane Doe',

                </div>

              </div>          <p className="text-sm font-medium text-gray-600">{title}</p>          createdAt: new Date().toISOString(),

            </div>

          </div>          <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>          uploaded: true,

        </div>

      )}          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}          representativeId: 'rep123'



      {/* Records Tab */}        </div>        },

      {activeTab === 'records' && (

        <div className="space-y-6">        <div className={`p-3 bg-${color}-100 rounded-full`}>        {

          {/* Filters */}

          <div className="bg-white rounded-lg shadow p-6">          <Icon className={`h-8 w-8 text-${color}-600`} />          _id: '2',

            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">

              <Filter className="h-5 w-5 mr-2" />        </div>          healthId: 'CHR987654321',

              Filters

            </h3>      </div>          childName: 'Mary Smith',

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

              <div>    </div>          age: 3,

                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>

                <div className="relative">  );          weight: 12.5,

                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />

                  <input          height: 85,

                    type="text"

                    value={filters.search}  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (          parentName: 'Sarah Smith',

                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}

                    className="pl-10 form-input"    <button          createdAt: new Date(Date.now() - 86400000).toISOString(),

                    placeholder="Name or Health ID"

                  />      onClick={() => onClick(id)}          uploaded: false,

                </div>

              </div>      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${          representativeId: 'rep456'

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>        active         }

                <input

                  type="date"          ? 'bg-primary-100 text-primary-700 border border-primary-200'       ]);

                  value={filters.dateFrom}

                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}          : 'text-gray-600 hover:bg-gray-100'    } finally {

                  className="form-input"

                />      }`}      setLoading(false);

              </div>

              <div>    >    }

                <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>

                <input      <Icon className="h-4 w-4" />  };

                  type="date"

                  value={filters.dateTo}      <span>{label}</span>

                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}

                  className="form-input"    </button>  const loadStats = async () => {

                />

              </div>  );    try {

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Sync Status</label>      // Calculate stats from current data

                <select

                  value={filters.uploaded}  if (loading) {      const total = records.length;

                  onChange={(e) => setFilters(prev => ({ ...prev, uploaded: e.target.value }))}

                  className="form-input"    return (      const uploaded = records.filter(r => r.uploaded).length;

                >

                  <option value="">All</option>      <div className="flex items-center justify-center min-h-screen">      const pending = total - uploaded;

                  <option value="true">Uploaded</option>

                  <option value="false">Pending</option>        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>      const uniqueReps = new Set(records.map(r => r.representativeId)).size;

                </select>

              </div>      </div>

              <div className="flex items-end">

                <button    );      setStats({

                  onClick={handleDownloadSummary}

                  className="w-full btn-primary flex items-center justify-center space-x-2"  }        totalRecords: total,

                >

                  <Download className="h-4 w-4" />        uploadedRecords: uploaded,

                  <span>Export PDF</span>

                </button>  return (        pendingRecords: pending,

              </div>

            </div>    <div className="space-y-8">        representatives: uniqueReps

          </div>

      {/* Header */}      });

          {/* Records Table */}

          <div className="bg-white rounded-lg shadow overflow-hidden">      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white">    } catch (error) {

            <div className="overflow-x-auto">

              <table className="min-w-full divide-y divide-gray-200">        <div className="flex items-center justify-between">      console.error('Failed to load stats:', error);

                <thead className="bg-gray-50">

                  <tr>          <div>    }

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                      Child Information            <h1 className="text-3xl font-bold">Admin Dashboard</h1>  };

                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">            <p className="text-primary-100 mt-2">Child Health Record Management System</p>

                      Measurements

                    </th>          </div>  const handleFilterChange = (key, value) => {

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                      Date          <div className="text-right">    setFilters(prev => ({ ...prev, [key]: value }));

                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">            <p className="text-primary-100">Total Records</p>    setPagination(prev => ({ ...prev, currentPage: 1 }));

                      Status

                    </th>            <p className="text-4xl font-bold">{stats.totalRecords}</p>  };

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                      Actions          </div>

                    </th>

                  </tr>        </div>  const resetFilters = () => {

                </thead>

                <tbody className="bg-white divide-y divide-gray-200">      </div>    setFilters({

                  {filteredRecords.map((record) => {

                    const bmi = record.weight && record.height       search: '',

                      ? (record.weight / Math.pow(record.height / 100, 2)).toFixed(1)

                      : 'N/A';      {/* Navigation Tabs */}      dateFrom: '',

                    

                    return (      <div className="flex space-x-4 border-b border-gray-200 pb-4">      dateTo: '',

                      <tr key={record.id} className="hover:bg-gray-50">

                        <td className="px-6 py-4">        <TabButton       uploaded: '',

                          <div>

                            <div className="text-sm font-medium text-gray-900">{record.childName}</div>          id="overview"       representative: ''

                            <div className="text-sm text-gray-500">ID: {record.healthId}</div>

                            <div className="text-sm text-gray-500">Age: {record.age} years</div>          label="Overview"     });

                          </div>

                        </td>          icon={BarChart3}   };

                        <td className="px-6 py-4">

                          <div className="text-sm text-gray-900">          active={activeTab === 'overview'} 

                            {record.weight}kg / {record.height}cm

                          </div>          onClick={setActiveTab}   const downloadHealthBooklet = async (healthId) => {

                          <div className="text-sm text-gray-500">BMI: {bmi}</div>

                        </td>        />    try {

                        <td className="px-6 py-4 text-sm text-gray-500">

                          {formatDate(record.timestamp)}        <TabButton       const blob = await apiService.downloadHealthBooklet(healthId);

                        </td>

                        <td className="px-6 py-4">          id="records"       const url = window.URL.createObjectURL(blob);

                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${

                            record.uploaded           label="Records"       const a = document.createElement('a');

                              ? 'bg-green-100 text-green-800' 

                              : 'bg-yellow-100 text-yellow-800'          icon={FileText}       a.href = url;

                          }`}>

                            {record.uploaded ? 'Uploaded' : 'Pending'}          active={activeTab === 'records'}       a.download = `health-booklet-${healthId}.pdf`;

                          </span>

                        </td>          onClick={setActiveTab}       document.body.appendChild(a);

                        <td className="px-6 py-4 text-sm font-medium">

                          <button        />      a.click();

                            onClick={() => handleViewDetails(record)}

                            className="text-primary-600 hover:text-primary-900"        <TabButton       document.body.removeChild(a);

                          >

                            <Eye className="h-4 w-4" />          id="analytics"       window.URL.revokeObjectURL(url);

                          </button>

                        </td>          label="Analytics"     } catch (error) {

                      </tr>

                    );          icon={TrendingUp}       console.error('Failed to download booklet:', error);

                  })}

                </tbody>          active={activeTab === 'analytics'}       alert('Failed to download health booklet. Please try again.');

              </table>

            </div>          onClick={setActiveTab}     }

            

            {filteredRecords.length === 0 && (        />  };

              <div className="text-center py-12">

                <FileText className="mx-auto h-12 w-12 text-gray-400" />      </div>

                <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>

                <p className="mt-1 text-sm text-gray-500">Try adjusting your filters</p>  const exportData = () => {

              </div>

            )}      {/* Overview Tab */}    const csv = [

          </div>

        </div>      {activeTab === 'overview' && (      ['Health ID', 'Child Name', 'Age', 'Weight', 'Height', 'Parent', 'Created', 'Status'],

      )}

        <div className="space-y-8">      ...records.map(r => [

      {/* Analytics Tab */}

      {activeTab === 'analytics' && (          {/* Stats Grid */}        r.healthId,

        <div className="space-y-6">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">        r.childName,

            {/* Age Distribution */}

            <div className="bg-white rounded-lg shadow p-6">            <StatCard         r.age,

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>

              <div className="space-y-3">              title="Total Records"         r.weight,

                {[0, 2, 5, 10, 15].map((minAge, index, arr) => {

                  const maxAge = arr[index + 1] || 18;              value={stats.totalRecords}         r.height,

                  const count = records.filter(r => r.age >= minAge && r.age < maxAge).length;

                  const percentage = (count / records.length) * 100 || 0;              icon={FileText}         r.parentName,

                  

                  return (              color="blue"         new Date(r.createdAt).toLocaleDateString(),

                    <div key={minAge} className="flex items-center justify-between">

                      <span className="text-sm text-gray-600">            />        r.uploaded ? 'Uploaded' : 'Pending'

                        {minAge === 15 ? '15-18 years' : `${minAge}-${maxAge - 1} years`}

                      </span>            <StatCard       ])

                      <div className="flex items-center space-x-2">

                        <div className="w-32 bg-gray-200 rounded-full h-2">              title="Uploaded"     ].map(row => row.join(',')).join('\n');

                          <div 

                            className="bg-primary-500 h-2 rounded-full"               value={stats.uploadedRecords} 

                            style={{ width: `${percentage}%` }}

                          ></div>              icon={CheckCircle}     const blob = new Blob([csv], { type: 'text/csv' });

                        </div>

                        <span className="text-sm font-medium w-12 text-right">{count}</span>              color="green"     const url = window.URL.createObjectURL(blob);

                      </div>

                    </div>              subtitle={`${((stats.uploadedRecords / stats.totalRecords) * 100 || 0).toFixed(1)}% of total`}    const a = document.createElement('a');

                  );

                })}            />    a.href = url;

              </div>

            </div>            <StatCard     a.download = `child-health-records-${new Date().toISOString().split('T')[0]}.csv`;



            {/* Representative Performance */}              title="Pending Sync"     document.body.appendChild(a);

            <div className="bg-white rounded-lg shadow p-6">

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Representative Performance</h3>              value={stats.pendingRecords}     a.click();

              <div className="space-y-3">

                {Array.from(stats.representatives).map((repId) => {              icon={Clock}     document.body.removeChild(a);

                  const repRecords = records.filter(r => r.representativeId === repId);

                  const uploaded = repRecords.filter(r => r.uploaded).length;              color="yellow"     window.URL.revokeObjectURL(url);

                  

                  return (              subtitle={`${((stats.pendingRecords / stats.totalRecords) * 100 || 0).toFixed(1)}% of total`}  };

                    <div key={repId} className="flex items-center justify-between">

                      <span className="text-sm text-gray-600 truncate">{repId}</span>            />

                      <div className="flex items-center space-x-2">

                        <span className="text-sm text-gray-500">{uploaded}/{repRecords.length}</span>            <StatCard   const formatDate = (dateString) => {

                        <div className="w-24 bg-gray-200 rounded-full h-2">

                          <div               title="Field Representatives"     return new Date(dateString).toLocaleDateString('en-US', {

                            className="bg-green-500 h-2 rounded-full" 

                            style={{ width: `${(uploaded / repRecords.length) * 100}%` }}              value={stats.representatives.size}       year: 'numeric',

                          ></div>

                        </div>              icon={Users}       month: 'short',

                      </div>

                    </div>              color="purple"       day: 'numeric',

                  );

                })}            />      hour: '2-digit',

              </div>

            </div>          </div>      minute: '2-digit'

          </div>

        </div>    });

      )}

          {/* Health Metrics */}  };

      {/* Record Details Modal */}

      <RecordDetailsModal          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        record={selectedRecord}

        isOpen={isModalOpen}            {/* BMI Distribution */}  const calculateBMI = (weight, height) => {

        onClose={handleCloseModal}

      />            <div className="bg-white rounded-lg shadow p-6">    if (!weight || !height) return 'N/A';

    </div>

  );              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">    const heightInM = height / 100;

};

                <Activity className="h-5 w-5 mr-2 text-green-600" />    return (weight / (heightInM * heightInM)).toFixed(1);

export default AdminPortal;
                BMI Distribution  };

              </h3>

              <div className="space-y-4">  return (

                <div className="flex items-center justify-between">    <div className="min-h-screen bg-gray-50 py-8">

                  <span className="text-sm text-gray-600">Average BMI</span>      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                  <span className="font-semibold text-lg">{stats.averageBMI} kg/m²</span>        {/* Header */}

                </div>        <div className="mb-8">

                <div className="space-y-2">          <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>

                  <div className="flex justify-between items-center">          <p className="mt-2 text-gray-600">Manage and analyze child health records</p>

                    <span className="text-sm text-red-600">Underweight</span>        </div>

                    <span className="font-medium">{stats.underweightCount}</span>

                  </div>        {/* Stats Cards */}

                  <div className="w-full bg-gray-200 rounded-full h-2">        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                    <div           <div className="bg-white p-6 rounded-lg shadow">

                      className="bg-red-500 h-2 rounded-full"             <div className="flex items-center">

                      style={{ width: `${(stats.underweightCount / stats.totalRecords) * 100}%` }}              <Users className="h-8 w-8 text-blue-600" />

                    ></div>              <div className="ml-4">

                  </div>                <p className="text-sm font-medium text-gray-500">Total Records</p>

                </div>                <p className="text-2xl font-bold text-gray-900">{stats.totalRecords}</p>

                <div className="space-y-2">              </div>

                  <div className="flex justify-between items-center">            </div>

                    <span className="text-sm text-green-600">Normal Weight</span>          </div>

                    <span className="font-medium">{stats.normalWeightCount}</span>

                  </div>          <div className="bg-white p-6 rounded-lg shadow">

                  <div className="w-full bg-gray-200 rounded-full h-2">            <div className="flex items-center">

                    <div               <TrendingUp className="h-8 w-8 text-green-600" />

                      className="bg-green-500 h-2 rounded-full"               <div className="ml-4">

                      style={{ width: `${(stats.normalWeightCount / stats.totalRecords) * 100}%` }}                <p className="text-sm font-medium text-gray-500">Uploaded</p>

                    ></div>                <p className="text-2xl font-bold text-gray-900">{stats.uploadedRecords}</p>

                  </div>              </div>

                </div>            </div>

                <div className="space-y-2">          </div>

                  <div className="flex justify-between items-center">

                    <span className="text-sm text-orange-600">Overweight</span>          <div className="bg-white p-6 rounded-lg shadow">

                    <span className="font-medium">{stats.overweightCount}</span>            <div className="flex items-center">

                  </div>              <Calendar className="h-8 w-8 text-yellow-600" />

                  <div className="w-full bg-gray-200 rounded-full h-2">              <div className="ml-4">

                    <div                 <p className="text-sm font-medium text-gray-500">Pending</p>

                      className="bg-orange-500 h-2 rounded-full"                 <p className="text-2xl font-bold text-gray-900">{stats.pendingRecords}</p>

                      style={{ width: `${(stats.overweightCount / stats.totalRecords) * 100}%` }}              </div>

                    ></div>            </div>

                  </div>          </div>

                </div>

              </div>          <div className="bg-white p-6 rounded-lg shadow">

            </div>            <div className="flex items-center">

              <MapPin className="h-8 w-8 text-purple-600" />

            {/* Health Alerts */}              <div className="ml-4">

            <div className="bg-white rounded-lg shadow p-6">                <p className="text-sm font-medium text-gray-500">Representatives</p>

              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">                <p className="text-2xl font-bold text-gray-900">{stats.representatives}</p>

                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />              </div>

                Health Alerts            </div>

              </h3>          </div>

              <div className="space-y-4">        </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">

                  <div className="flex items-center justify-between">        {/* Filters */}

                    <span className="text-sm font-medium text-red-800">Malnutrition Cases</span>        <div className="bg-white p-6 rounded-lg shadow mb-6">

                    <span className="text-xl font-bold text-red-900">{stats.malnutritionCases}</span>          <div className="flex items-center justify-between mb-4">

                  </div>            <h2 className="text-lg font-semibold text-gray-900">Filters & Search</h2>

                  <p className="text-xs text-red-600 mt-1">            <button

                    {((stats.malnutritionCases / stats.totalRecords) * 100 || 0).toFixed(1)}% of total records              onClick={resetFilters}

                  </p>              className="text-sm text-gray-500 hover:text-gray-700"

                </div>            >

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">              Reset Filters

                  <div className="flex items-center justify-between">            </button>

                    <span className="text-sm font-medium text-yellow-800">Recent Illness Cases</span>          </div>

                    <span className="text-xl font-bold text-yellow-900">{stats.recentIllnessCases}</span>          

                  </div>          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                  <p className="text-xs text-yellow-600 mt-1">            <div>

                    {((stats.recentIllnessCases / stats.totalRecords) * 100 || 0).toFixed(1)}% of total records              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>

                  </p>              <div className="relative">

                </div>                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">                <input

                  <div className="flex items-center justify-between">                  type="text"

                    <span className="text-sm font-medium text-blue-800">Underweight Children</span>                  value={filters.search}

                    <span className="text-xl font-bold text-blue-900">{stats.underweightCount}</span>                  onChange={(e) => handleFilterChange('search', e.target.value)}

                  </div>                  placeholder="Name, Health ID..."

                  <p className="text-xs text-blue-600 mt-1">                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                    Requires nutritional intervention                />

                  </p>              </div>

                </div>            </div>

              </div>

            </div>            <div>

          </div>              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>

        </div>              <select

      )}                value={filters.uploaded}

                onChange={(e) => handleFilterChange('uploaded', e.target.value)}

      {/* Records Tab */}                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

      {activeTab === 'records' && (              >

        <div className="space-y-6">                <option value="">All Records</option>

          {/* Filters */}                <option value="true">Uploaded</option>

          <div className="bg-white rounded-lg shadow p-6">                <option value="false">Pending</option>

            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">              </select>

              <Filter className="h-5 w-5 mr-2" />            </div>

              Filters

            </h3>            <div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>

              <div>              <input

                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>                type="date"

                <div className="relative">                value={filters.dateFrom}

                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}

                  <input                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                    type="text"              />

                    value={filters.search}            </div>

                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}

                    className="pl-10 form-input"            <div>

                    placeholder="Name or Health ID"              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>

                  />              <input

                </div>                type="date"

              </div>                value={filters.dateTo}

              <div>                onChange={(e) => handleFilterChange('dateTo', e.target.value)}

                <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                <input              />

                  type="date"            </div>

                  value={filters.dateFrom}          </div>

                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}        </div>

                  className="form-input"

                />        {/* Actions */}

              </div>        <div className="flex justify-between items-center mb-6">

              <div>          <h2 className="text-lg font-semibold text-gray-900">

                <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>            Records ({pagination.totalCount || records.length})

                <input          </h2>

                  type="date"          <div className="flex space-x-3">

                  value={filters.dateTo}            <button

                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}              onClick={exportData}

                  className="form-input"              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"

                />            >

              </div>              <Download className="h-4 w-4" />

              <div>              <span>Export CSV</span>

                <label className="block text-sm font-medium text-gray-700 mb-1">Sync Status</label>            </button>

                <select            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">

                  value={filters.uploaded}              <BarChart3 className="h-4 w-4" />

                  onChange={(e) => setFilters(prev => ({ ...prev, uploaded: e.target.value }))}              <span>Analytics</span>

                  className="form-input"            </button>

                >          </div>

                  <option value="">All</option>        </div>

                  <option value="true">Uploaded</option>

                  <option value="false">Pending</option>        {/* Records Table */}

                </select>        <div className="bg-white shadow rounded-lg overflow-hidden">

              </div>          {loading ? (

              <div className="flex items-end">            <div className="p-8 text-center">

                <button              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>

                  onClick={handleDownloadSummary}              <p className="mt-2 text-gray-600">Loading records...</p>

                  className="w-full btn-primary flex items-center justify-center space-x-2"            </div>

                >          ) : records.length === 0 ? (

                  <Download className="h-4 w-4" />            <div className="p-8 text-center">

                  <span>Export PDF</span>              <Users className="mx-auto h-12 w-12 text-gray-400" />

                </button>              <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>

              </div>              <p className="mt-1 text-sm text-gray-500">No child health records match your current filters.</p>

            </div>            </div>

          </div>          ) : (

            <div className="overflow-x-auto">

          {/* Records Table */}              <table className="min-w-full divide-y divide-gray-200">

          <div className="bg-white rounded-lg shadow overflow-hidden">                <thead className="bg-gray-50">

            <div className="overflow-x-auto">                  <tr>

              <table className="min-w-full divide-y divide-gray-200">                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                <thead className="bg-gray-50">                      Child

                  <tr>                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                      Child Information                      Health Data

                    </th>                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                      Measurements                      Parent

                    </th>                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                      Date                      Created

                    </th>                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                      Status                      Status

                    </th>                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                      Actions                      Actions

                    </th>                    </th>

                  </tr>                  </tr>

                </thead>                </thead>

                <tbody className="bg-white divide-y divide-gray-200">                <tbody className="bg-white divide-y divide-gray-200">

                  {filteredRecords.map((record) => {                  {records.map((record) => (

                    const bmi = record.weight && record.height                     <tr key={record._id} className="hover:bg-gray-50">

                      ? (record.weight / Math.pow(record.height / 100, 2)).toFixed(1)                      <td className="px-6 py-4 whitespace-nowrap">

                      : 'N/A';                        <div>

                                              <div className="text-sm font-medium text-gray-900">{record.childName}</div>

                    return (                          <div className="text-sm text-gray-500">ID: {record.healthId}</div>

                      <tr key={record.id} className="hover:bg-gray-50">                          <div className="text-sm text-gray-500">Age: {record.age} years</div>

                        <td className="px-6 py-4">                        </div>

                          <div>                      </td>

                            <div className="text-sm font-medium text-gray-900">{record.childName}</div>                      <td className="px-6 py-4 whitespace-nowrap">

                            <div className="text-sm text-gray-500">ID: {record.healthId}</div>                        <div className="text-sm text-gray-900">

                            <div className="text-sm text-gray-500">Age: {record.age} years</div>                          {record.weight}kg, {record.height}cm

                          </div>                        </div>

                        </td>                        <div className="text-sm text-gray-500">

                        <td className="px-6 py-4">                          BMI: {calculateBMI(record.weight, record.height)}

                          <div className="text-sm text-gray-900">                        </div>

                            {record.weight}kg / {record.height}cm                      </td>

                          </div>                      <td className="px-6 py-4 whitespace-nowrap">

                          <div className="text-sm text-gray-500">BMI: {bmi}</div>                        <div className="text-sm text-gray-900">{record.parentName}</div>

                        </td>                      </td>

                        <td className="px-6 py-4 text-sm text-gray-500">                      <td className="px-6 py-4 whitespace-nowrap">

                          {formatDate(record.timestamp)}                        <div className="text-sm text-gray-900">{formatDate(record.createdAt)}</div>

                        </td>                        <div className="text-sm text-gray-500">Rep: {record.representativeId}</div>

                        <td className="px-6 py-4">                      </td>

                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${                      <td className="px-6 py-4 whitespace-nowrap">

                            record.uploaded                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${

                              ? 'bg-green-100 text-green-800'                           record.uploaded 

                              : 'bg-yellow-100 text-yellow-800'                            ? 'bg-green-100 text-green-800' 

                          }`}>                            : 'bg-yellow-100 text-yellow-800'

                            {record.uploaded ? 'Uploaded' : 'Pending'}                        }`}>

                          </span>                          {record.uploaded ? 'Uploaded' : 'Pending'}

                        </td>                        </span>

                        <td className="px-6 py-4 text-sm font-medium">                      </td>

                          <button                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">

                            onClick={() => handleViewDetails(record)}                        <button

                            className="text-primary-600 hover:text-primary-900"                          onClick={() => downloadHealthBooklet(record.healthId)}

                          >                          className="text-blue-600 hover:text-blue-900"

                            <Eye className="h-4 w-4" />                        >

                          </button>                          Download PDF

                        </td>                        </button>

                      </tr>                      </td>

                    );                    </tr>

                  })}                  ))}

                </tbody>                </tbody>

              </table>              </table>

            </div>            </div>

                      )}

            {filteredRecords.length === 0 && (        </div>

              <div className="text-center py-12">

                <FileText className="mx-auto h-12 w-12 text-gray-400" />        {/* Pagination */}

                <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>        {pagination.totalPages > 1 && (

                <p className="mt-1 text-sm text-gray-500">Try adjusting your filters</p>          <div className="flex items-center justify-between mt-6">

              </div>            <div className="text-sm text-gray-700">

            )}              Showing page {pagination.currentPage} of {pagination.totalPages}

          </div>            </div>

        </div>            <div className="flex space-x-2">

      )}              <button

                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}

      {/* Analytics Tab */}                disabled={pagination.currentPage === 1}

      {activeTab === 'analytics' && (                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"

        <div className="space-y-6">              >

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">                Previous

            {/* Age Distribution */}              </button>

            <div className="bg-white rounded-lg shadow p-6">              <button

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}

              <div className="space-y-3">                disabled={pagination.currentPage === pagination.totalPages}

                {[0, 2, 5, 10, 15].map((minAge, index, arr) => {                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"

                  const maxAge = arr[index + 1] || 18;              >

                  const count = records.filter(r => r.age >= minAge && r.age < maxAge).length;                Next

                  const percentage = (count / records.length) * 100 || 0;              </button>

                              </div>

                  return (          </div>

                    <div key={minAge} className="flex items-center justify-between">        )}

                      <span className="text-sm text-gray-600">      </div>

                        {minAge === 15 ? '15-18 years' : `${minAge}-${maxAge - 1} years`}    </div>

                      </span>  );

                      <div className="flex items-center space-x-2">};

                        <div className="w-32 bg-gray-200 rounded-full h-2">

                          <div export default AdminPortal;
                            className="bg-primary-500 h-2 rounded-full" 
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
                {Array.from(stats.representatives).map((repId) => {
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
                })}
              </div>
            </div>
          </div>
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

export default AdminPortal;
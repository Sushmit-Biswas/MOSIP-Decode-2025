class ExportService {
  /**
   * Generate CSV export for child health records
   */
  generateCSV(records) {
    if (!records || records.length === 0) {
      throw new Error('No records to export');
    }

    // CSV headers
    const headers = [
      'Health ID',
      'Child Name',
      'Age (years)',
      'Weight (kg)',
      'Height (cm)',
      'BMI',
      'BMI Category',
      'Parent/Guardian',
      'Malnutrition Signs',
      'Recent Illnesses',
      'Parental Consent',
      'Representative ID',
      'Location Latitude',
      'Location Longitude',
      'Location Accuracy',
      'Upload Status',
      'Created Date',
      'Uploaded Date'
    ];

    // Convert records to CSV rows
    const rows = records.map(record => {
      const bmi = this.calculateBMI(record.weight, record.height);
      const bmiCategory = this.getBMICategory(bmi);
      
      return [
        record.healthId || '',
        record.childName || '',
        record.age || '',
        record.weight || '',
        record.height || '',
        bmi || '',
        bmiCategory || '',
        record.parentName || '',
        (record.malnutritionSigns || '').replace(/,/g, ';'), // Replace commas to avoid CSV issues
        (record.recentIllnesses || '').replace(/,/g, ';'),
        record.parentalConsent ? 'Yes' : 'No',
        record.representativeId || '',
        record.location?.latitude || '',
        record.location?.longitude || '',
        record.location?.accuracy || '',
        record.uploaded ? 'Uploaded' : 'Pending',
        new Date(record.timestamp).toISOString(),
        record.uploadedAt ? new Date(record.uploadedAt).toISOString() : ''
      ];
    });

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * Generate TXT export for child health records
   */
  generateTXT(records) {
    if (!records || records.length === 0) {
      throw new Error('No records to export');
    }

    let txtContent = `SEHAT SAATHI - CHILD HEALTH RECORDS EXPORT\n`;
    txtContent += `Generated on: ${new Date().toLocaleString()}\n`;
    txtContent += `Total Records: ${records.length}\n`;
    txtContent += `${'='.repeat(60)}\n\n`;

    records.forEach((record, index) => {
      const bmi = this.calculateBMI(record.weight, record.height);
      const bmiCategory = this.getBMICategory(bmi);
      
      txtContent += `RECORD ${index + 1}\n`;
      txtContent += `${'-'.repeat(20)}\n`;
      txtContent += `Health ID: ${record.healthId || 'N/A'}\n`;
      txtContent += `Child Name: ${record.childName || 'N/A'}\n`;
      txtContent += `Age: ${record.age || 'N/A'} years\n`;
      txtContent += `Weight: ${record.weight || 'N/A'} kg\n`;
      txtContent += `Height: ${record.height || 'N/A'} cm\n`;
      txtContent += `BMI: ${bmi || 'N/A'} (${bmiCategory || 'N/A'})\n`;
      txtContent += `Parent/Guardian: ${record.parentName || 'N/A'}\n`;
      txtContent += `Malnutrition Signs: ${record.malnutritionSigns || 'None reported'}\n`;
      txtContent += `Recent Illnesses: ${record.recentIllnesses || 'None reported'}\n`;
      txtContent += `Parental Consent: ${record.parentalConsent ? 'Yes' : 'No'}\n`;
      txtContent += `Representative ID: ${record.representativeId || 'N/A'}\n`;
      
      if (record.location?.latitude && record.location?.longitude) {
        txtContent += `Location: ${record.location.latitude}, ${record.location.longitude} (±${record.location.accuracy}m)\n`;
      } else {
        txtContent += `Location: Not recorded\n`;
      }
      
      txtContent += `Status: ${record.uploaded ? 'Uploaded' : 'Pending Sync'}\n`;
      txtContent += `Created: ${new Date(record.timestamp).toLocaleString()}\n`;
      
      if (record.uploadedAt) {
        txtContent += `Uploaded: ${new Date(record.uploadedAt).toLocaleString()}\n`;
      }
      
      txtContent += `\n`;
    });

    // Add summary statistics
    txtContent += `\nSUMMARY STATISTICS\n`;
    txtContent += `${'='.repeat(60)}\n`;
    
    const uploaded = records.filter(r => r.uploaded).length;
    const pending = records.length - uploaded;
    
    txtContent += `Total Records: ${records.length}\n`;
    txtContent += `Uploaded: ${uploaded} (${((uploaded / records.length) * 100).toFixed(1)}%)\n`;
    txtContent += `Pending Sync: ${pending} (${((pending / records.length) * 100).toFixed(1)}%)\n`;
    
    // BMI statistics
    const bmiRecords = records.filter(r => r.weight && r.height);
    if (bmiRecords.length > 0) {
      const underweight = bmiRecords.filter(r => {
        const bmi = this.calculateBMI(r.weight, r.height);
        return bmi && parseFloat(bmi) < 18.5;
      }).length;
      
      const normal = bmiRecords.filter(r => {
        const bmi = this.calculateBMI(r.weight, r.height);
        return bmi && parseFloat(bmi) >= 18.5 && parseFloat(bmi) < 25;
      }).length;
      
      const overweight = bmiRecords.filter(r => {
        const bmi = this.calculateBMI(r.weight, r.height);
        return bmi && parseFloat(bmi) >= 25;
      }).length;
      
      txtContent += `\nBMI DISTRIBUTION:\n`;
      txtContent += `Underweight: ${underweight} (${((underweight / bmiRecords.length) * 100).toFixed(1)}%)\n`;
      txtContent += `Normal Weight: ${normal} (${((normal / bmiRecords.length) * 100).toFixed(1)}%)\n`;
      txtContent += `Overweight: ${overweight} (${((overweight / bmiRecords.length) * 100).toFixed(1)}%)\n`;
    }
    
    // Health alerts
    const malnutrition = records.filter(r => r.malnutritionSigns && r.malnutritionSigns !== 'N/A' && r.malnutritionSigns.trim() !== '').length;
    const recentIllness = records.filter(r => r.recentIllnesses && r.recentIllnesses !== 'N/A' && r.recentIllnesses.trim() !== '').length;
    
    txtContent += `\nHEALTH ALERTS:\n`;
    txtContent += `Malnutrition Cases: ${malnutrition}\n`;
    txtContent += `Recent Illness Cases: ${recentIllness}\n`;
    
    return txtContent;
  }

  /**
   * Generate Activity Logs CSV
   */
  generateActivityLogsCSV() {
    try {
      const logs = JSON.parse(localStorage.getItem('auth_activity_logs') || '[]');
      
      if (logs.length === 0) {
        throw new Error('No activity logs to export');
      }

      const headers = [
        'Timestamp',
        'User ID',
        'User Name',
        'User Role',
        'Action',
        'Session ID',
        'User Agent'
      ];

      const rows = logs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.userId || '',
        log.userName || '',
        log.userRole || '',
        log.action || '',
        log.sessionId || '',
        log.userAgent || ''
      ]);

      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      return csvContent;
    } catch (error) {
      throw new Error('Failed to generate activity logs: ' + error.message);
    }
  }

  /**
   * Generate Activity Logs TXT
   */
  generateActivityLogsTXT() {
    try {
      const logs = JSON.parse(localStorage.getItem('auth_activity_logs') || '[]');
      
      if (logs.length === 0) {
        throw new Error('No activity logs to export');
      }

      let txtContent = '=== SEHAT SAATHI ACTIVITY LOGS ===\\n\\n';
      txtContent += `Generated on: ${new Date().toISOString()}\\n`;
      txtContent += `Total logs: ${logs.length}\\n\\n`;
      txtContent += ''.padEnd(80, '=') + '\\n\\n';

      logs.forEach((log, index) => {
        txtContent += `[${index + 1}] ${new Date(log.timestamp).toLocaleString()}\\n`;
        txtContent += `    User: ${log.userName || 'Unknown'} (ID: ${log.userId || 'N/A'})\\n`;
        txtContent += `    Role: ${log.userRole || 'N/A'}\\n`;
        txtContent += `    Action: ${log.action || 'N/A'}\\n`;
        txtContent += `    Session: ${log.sessionId || 'N/A'}\\n`;
        txtContent += `    User Agent: ${log.userAgent || 'N/A'}\\n`;
        txtContent += ''.padEnd(80, '-') + '\\n\\n';
      });

      return txtContent;
    } catch (error) {
      throw new Error('Failed to generate activity logs TXT: ' + error.message);
    }
  }

  /**
   * Download file with given content and filename
   */
  downloadFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Helper method to calculate BMI
   */
  calculateBMI(weight, height) {
    if (!weight || !height) return null;
    const heightInM = height / 100;
    const bmi = (weight / (heightInM * heightInM)).toFixed(1);
    return bmi;
  }

  /**
   * Helper method to get BMI category
   */
  getBMICategory(bmi) {
    if (!bmi) return null;
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return 'Underweight';
    if (bmiValue < 25) return 'Normal';
    if (bmiValue < 30) return 'Overweight';
    return 'Obese';
  }
}

// Create singleton instance
const exportService = new ExportService();

export default exportService;
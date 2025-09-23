import jsPDF from 'jspdf';

class PDFService {
  constructor() {
    this.defaultOptions = {
      format: 'a4',
      orientation: 'portrait',
      unit: 'mm',
      margin: 20,
      quality: 1.0,
      scale: 2
    };
  }

  /**
   * Generate a comprehensive health booklet PDF for a child record
   * @param {Object} childRecord - Complete child record data
   * @returns {Promise<Blob>} PDF blob
   */
  async generateHealthBooklet(childRecord) {
    const pdf = new jsPDF(this.defaultOptions);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = this.defaultOptions.margin;
    
    let yPosition = margin;

    // Header Section
    yPosition = this.addHeader(pdf, pageWidth, margin, yPosition);

    // Child Information Section
    yPosition = this.addChildInformation(pdf, childRecord, pageWidth, margin, yPosition);

    // Health Metrics Section
    yPosition = this.addHealthMetrics(pdf, childRecord, pageWidth, margin, yPosition);

    // Medical History Section
    yPosition = this.addMedicalHistory(pdf, childRecord, pageWidth, margin, yPosition);

    // Photo Section (if available)
    if (childRecord.photo) {
      yPosition = await this.addPhotoSection(pdf, childRecord.photo, pageWidth, margin, yPosition, pageHeight);
    }

    // Location Information
    if (childRecord.location) {
      yPosition = this.addLocationInfo(pdf, childRecord.location, pageWidth, margin, yPosition);
    }

    // Representative Information
    this.addRepresentativeInfo(pdf, childRecord, pageWidth, margin, yPosition);

    // Footer
    this.addFooter(pdf, pageWidth, pageHeight, margin);

    // Add watermark
    this.addWatermark(pdf, pageWidth, pageHeight);

    return pdf.output('blob');
  }

  /**
   * Add header with title and health ID
   */
  addHeader(pdf, pageWidth, margin, yPosition) {
    // Title
    pdf.setFontSize(20);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(44, 82, 246); // Primary blue
    pdf.text('Child Health Record Booklet', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;

    // Subtitle
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(107, 114, 128); // Gray
    pdf.text('Official Health Documentation', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 20;

    // Divider line
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    
    return yPosition + 15;
  }

  /**
   * Add child information section
   */
  addChildInformation(pdf, childRecord, pageWidth, margin, yPosition) {
    // Section Title
    yPosition = this.addSectionTitle(pdf, 'Child Information', margin, yPosition);

    // Health ID Box
    pdf.setFillColor(239, 246, 255); // Light blue background
    pdf.setDrawColor(59, 130, 246); // Blue border
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 15, 2, 2, 'FD');
    
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(59, 130, 246);
    pdf.text(`Health ID: ${childRecord.healthId}`, margin + 5, yPosition + 10);
    
    yPosition += 25;

    // Child details in two columns
    const leftColumn = margin;
    const rightColumn = pageWidth / 2;

    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(0, 0, 0);

    // Left column
    yPosition = this.addFieldValue(pdf, 'Full Name:', childRecord.childName, leftColumn, yPosition);
    yPosition = this.addFieldValue(pdf, 'Age:', `${childRecord.age} years`, leftColumn, yPosition);
    yPosition = this.addFieldValue(pdf, 'Parent/Guardian:', childRecord.parentName, leftColumn, yPosition);

    // Right column (reset yPosition for right column)
    let rightYPosition = yPosition - 24; // Start at same level as left column
    rightYPosition = this.addFieldValue(pdf, 'Record Date:', new Date(childRecord.timestamp).toLocaleDateString(), rightColumn, rightYPosition);
    rightYPosition = this.addFieldValue(pdf, 'Record Time:', new Date(childRecord.timestamp).toLocaleTimeString(), rightColumn, rightYPosition);
    
    return Math.max(yPosition, rightYPosition) + 15;
  }

  /**
   * Add health metrics section
   */
  addHealthMetrics(pdf, childRecord, pageWidth, margin, yPosition) {
    yPosition = this.addSectionTitle(pdf, 'Physical Measurements', margin, yPosition);

    // Measurements table
    const tableData = [
      ['Measurement', 'Value', 'Status'],
      ['Weight', `${childRecord.weight} kg`, this.getWeightStatus(childRecord.weight, childRecord.age)],
      ['Height', `${childRecord.height} cm`, this.getHeightStatus(childRecord.height, childRecord.age)],
      ['BMI', this.calculateBMI(childRecord.weight, childRecord.height), this.getBMIStatus(childRecord.weight, childRecord.height)]
    ];

    yPosition = this.addTable(pdf, tableData, margin, yPosition, pageWidth - 2 * margin);

    return yPosition + 15;
  }

  /**
   * Add medical history section
   */
  addMedicalHistory(pdf, childRecord, pageWidth, margin, yPosition) {
    yPosition = this.addSectionTitle(pdf, 'Medical History', margin, yPosition);

    // Malnutrition signs
    yPosition = this.addFieldValue(pdf, 'Visible Signs of Malnutrition:', childRecord.malnutritionSigns || 'N/A', margin, yPosition, true);
    yPosition += 5;

    // Recent illnesses
    yPosition = this.addFieldValue(pdf, 'Recent Illnesses:', childRecord.recentIllnesses || 'N/A', margin, yPosition, true);
    yPosition += 5;

    // Consent status
    const consentStatus = childRecord.parentalConsent ? 'Yes - Consent provided' : 'No - Consent not provided';
    yPosition = this.addFieldValue(pdf, 'Parental Consent:', consentStatus, margin, yPosition);

    return yPosition + 15;
  }

  /**
   * Add photo section
   */
  async addPhotoSection(pdf, photoBase64, pageWidth, margin, yPosition, pageHeight) {
    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = margin;
    }

    yPosition = this.addSectionTitle(pdf, 'Child Photograph', margin, yPosition);

    try {
      // Calculate photo dimensions (max 60mm width, maintain aspect ratio)
      const maxWidth = 60;
      const maxHeight = 60;
      
      // Add photo
      pdf.addImage(photoBase64, 'JPEG', margin, yPosition, maxWidth, maxHeight);
      
      // Add border around photo
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(margin, yPosition, maxWidth, maxHeight);
      
      return yPosition + maxHeight + 10;
    } catch (error) {
      console.error('Error adding photo to PDF:', error);
      
      // Add placeholder text if photo fails
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text('Photo not available', margin, yPosition + 10);
      
      return yPosition + 20;
    }
  }

  /**
   * Add location information
   */
  addLocationInfo(pdf, location, pageWidth, margin, yPosition) {
    if (!location.latitude || !location.longitude) {
      return yPosition;
    }

    yPosition = this.addSectionTitle(pdf, 'Location Information', margin, yPosition);

    yPosition = this.addFieldValue(pdf, 'Coordinates:', location.coordinateString || `${location.latitude}, ${location.longitude}`, margin, yPosition);
    
    if (location.accuracy) {
      yPosition = this.addFieldValue(pdf, 'Accuracy:', `±${Math.round(location.accuracy)}m`, margin, yPosition);
    }
    
    if (location.formattedTime) {
      yPosition = this.addFieldValue(pdf, 'Captured:', new Date(location.formattedTime).toLocaleString(), margin, yPosition);
    }

    return yPosition + 15;
  }

  /**
   * Add representative information
   */
  addRepresentativeInfo(pdf, childRecord, pageWidth, margin, yPosition) {
    yPosition = this.addSectionTitle(pdf, 'Collection Information', margin, yPosition);

    yPosition = this.addFieldValue(pdf, 'Representative ID:', childRecord.representativeId || 'N/A', margin, yPosition);
    yPosition = this.addFieldValue(pdf, 'Sync Status:', childRecord.uploaded ? 'Uploaded to server' : 'Pending upload', margin, yPosition);
    
    if (childRecord.syncedAt) {
      yPosition = this.addFieldValue(pdf, 'Last Synced:', new Date(childRecord.syncedAt).toLocaleString(), margin, yPosition);
    }

    return yPosition + 15;
  }

  /**
   * Add footer with page numbers and generation info
   */
  addFooter(pdf, pageWidth, pageHeight, margin) {
    const footerY = pageHeight - 15;
    
    pdf.setFontSize(9);
    pdf.setTextColor(128, 128, 128);
    
    // Left footer - generation info
    pdf.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, footerY);
    
    // Right footer - page numbers
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin, footerY, { align: 'right' });
    }
  }

  /**
   * Add watermark - simplified version
   */
  addWatermark(pdf, pageWidth, pageHeight) {
    const pageCount = pdf.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      
      try {
        // Simple watermark without transparency
        pdf.setFontSize(30);
        pdf.setTextColor(200, 200, 200);
        
        // Add text in center without rotation
        const text = 'CHILD HEALTH RECORD';
        const textWidth = pdf.getTextWidth(text);
        pdf.text(text, (pageWidth - textWidth) / 2, pageHeight / 2, { 
          align: 'center',
          angle: 45 
        });
        
        // Reset color
        pdf.setTextColor(0, 0, 0);
      } catch (error) {
        console.warn('Could not add watermark:', error);
        // Continue without watermark if it fails
      }
    }
  }

  /**
   * Helper method to add section titles
   */
  addSectionTitle(pdf, title, x, y) {
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(75, 85, 99); // Dark gray
    pdf.text(title, x, y);
    
    // Add underline
    const textWidth = pdf.getTextWidth(title);
    pdf.setDrawColor(229, 231, 235);
    pdf.line(x, y + 2, x + textWidth, y + 2);
    
    return y + 12;
  }

  /**
   * Helper method to add field-value pairs
   */
  addFieldValue(pdf, field, value, x, y, multiline = false) {
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(field, x, y);
    
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(75, 85, 99);
    
    if (multiline && value.length > 50) {
      const lines = pdf.splitTextToSize(value, 150);
      pdf.text(lines, x + 45, y);
      return y + (lines.length * 5) + 5;
    } else {
      pdf.text(value, x + 45, y);
      return y + 8;
    }
  }

  /**
   * Helper method to add tables
   */
  addTable(pdf, data, x, y, width) {
    const rowHeight = 8;
    const colWidth = width / data[0].length;
    
    data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellX = x + (colIndex * colWidth);
        const cellY = y + (rowIndex * rowHeight);
        
        // Header row styling
        if (rowIndex === 0) {
          pdf.setFillColor(249, 250, 251);
          pdf.setDrawColor(229, 231, 235);
          pdf.rect(cellX, cellY - 5, colWidth, rowHeight, 'FD');
          
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'bold');
          pdf.setTextColor(0, 0, 0);
        } else {
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          pdf.setTextColor(75, 85, 99);
          
          // Alternate row colors
          if (rowIndex % 2 === 0) {
            pdf.setFillColor(249, 250, 251);
            pdf.rect(cellX, cellY - 5, colWidth, rowHeight, 'F');
          }
        }
        
        pdf.text(cell, cellX + 2, cellY);
      });
    });
    
    return y + (data.length * rowHeight) + 5;
  }

  /**
   * Calculate BMI
   */
  calculateBMI(weight, height) {
    if (!weight || !height) return 'N/A';
    const heightInM = height / 100;
    const bmi = (weight / (heightInM * heightInM)).toFixed(1);
    return `${bmi} kg/m²`;
  }

  /**
   * Get BMI status
   */
  getBMIStatus(weight, height) {
    if (!weight || !height) return 'N/A';
    const heightInM = height / 100;
    const bmi = weight / (heightInM * heightInM);
    
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  /**
   * Get weight status (simplified - would need age/gender specific charts)
   */
  getWeightStatus(weight, age) {
    // This is a simplified status - in production, use WHO growth charts
    if (age < 2) {
      return weight < 8 ? 'Below average' : weight > 15 ? 'Above average' : 'Normal range';
    } else if (age < 5) {
      return weight < 12 ? 'Below average' : weight > 20 ? 'Above average' : 'Normal range';
    } else {
      return weight < 15 ? 'Below average' : weight > 35 ? 'Above average' : 'Normal range';
    }
  }

  /**
   * Get height status (simplified - would need age/gender specific charts)
   */
  getHeightStatus(height, age) {
    // This is a simplified status - in production, use WHO growth charts
    if (age < 2) {
      return height < 70 ? 'Below average' : height > 90 ? 'Above average' : 'Normal range';
    } else if (age < 5) {
      return height < 90 ? 'Below average' : height > 120 ? 'Above average' : 'Normal range';
    } else {
      return height < 100 ? 'Below average' : height > 150 ? 'Above average' : 'Normal range';
    }
  }

  /**
   * Generate a quick summary PDF for multiple records
   */
  async generateSummaryReport(records) {
    const pdf = new jsPDF(this.defaultOptions);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = this.defaultOptions.margin;
    
    let yPosition = margin;

    // Report Header
    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(44, 82, 246);
    pdf.text('Child Health Records Summary', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 20;

    // Summary statistics
    yPosition = this.addSummaryStats(pdf, records, margin, yPosition);

    // Records table
    yPosition = this.addRecordsTable(pdf, records, margin, yPosition, pageWidth - 2 * margin);

    this.addFooter(pdf, pageWidth, pdf.internal.pageSize.getHeight(), margin);

    return pdf.output('blob');
  }

  /**
   * Add summary statistics
   */
  addSummaryStats(pdf, records, margin, yPosition) {
    const stats = this.calculateSummaryStats(records);
    
    yPosition = this.addSectionTitle(pdf, 'Summary Statistics', margin, yPosition);

    const statsData = [
      ['Metric', 'Count', 'Percentage'],
      ['Total Records', stats.total, '100%'],
      ['Male Children', stats.male, `${((stats.male / stats.total) * 100).toFixed(1)}%`],
      ['Female Children', stats.female, `${((stats.female / stats.total) * 100).toFixed(1)}%`],
      ['Underweight (BMI)', stats.underweight, `${((stats.underweight / stats.total) * 100).toFixed(1)}%`],
      ['Normal Weight (BMI)', stats.normal, `${((stats.normal / stats.total) * 100).toFixed(1)}%`],
      ['Overweight (BMI)', stats.overweight, `${((stats.overweight / stats.total) * 100).toFixed(1)}%`]
    ];

    return this.addTable(pdf, statsData, margin, yPosition, 150);
  }

  /**
   * Calculate summary statistics
   */
  calculateSummaryStats(records) {
    const stats = {
      total: records.length,
      male: 0,
      female: 0,
      underweight: 0,
      normal: 0,
      overweight: 0
    };

    records.forEach(record => {
      // Gender stats (if available)
      if (record.gender === 'male') stats.male++;
      if (record.gender === 'female') stats.female++;

      // BMI stats
      if (record.weight && record.height) {
        const heightInM = record.height / 100;
        const bmi = record.weight / (heightInM * heightInM);
        
        if (bmi < 18.5) stats.underweight++;
        else if (bmi < 25) stats.normal++;
        else stats.overweight++;
      }
    });

    return stats;
  }

  /**
   * Add records table
   */
  addRecordsTable(pdf, records, margin, yPosition, width) {
    const limitedRecords = records.slice(0, 20); // Limit to first 20 records
    
    const tableData = [
      ['Health ID', 'Name', 'Age', 'Weight', 'Height', 'Date']
    ];

    limitedRecords.forEach(record => {
      tableData.push([
        record.healthId || 'N/A',
        record.childName.substring(0, 15) + (record.childName.length > 15 ? '...' : ''),
        `${record.age}y`,
        `${record.weight}kg`,
        `${record.height}cm`,
        new Date(record.timestamp).toLocaleDateString()
      ]);
    });

    return this.addTable(pdf, tableData, margin, yPosition, width);
  }
}

// Create singleton instance
const pdfService = new PDFService();

export default pdfService;
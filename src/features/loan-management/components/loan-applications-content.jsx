'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as XLSX from 'xlsx';
import LoanApplicationsDataTable from './loan-applications-data-table';
import { fetchLoanApplicationsThunk } from '@/redux/Loan_Application/loanThunks';

export default function LoanApplicationsContent() {
  const dispatch = useDispatch();
  const { loanApplications, loading } = useSelector((state) => state.loan);
  
  // Fetch on mount - with cache invalidated by thunks, this will get fresh data
  useEffect(() => {
    // console.log('📡 Fetching loan applications on mount');
    // forceRefresh=false but cache is invalidated by update thunks, so we get fresh data
    dispatch(fetchLoanApplicationsThunk({ forceRefresh: false }));
  }, [dispatch]);

  // Log when loanApplications changes to verify re-rendering
  useEffect(() => {
    // console.log('💼 LoanApplications updated:', loanApplications?.length, 'applications');
  }, [loanApplications]);
  
  const applications = loanApplications || [];

  const handleExport = (data) => {
    // Get base URL for document links
    const baseUrl = window.location.origin;
    
    // Debug: Log document structure
    // console.log('📄 Export Debug:', {
    //   totalApps: data.length,
    //   firstAppDocs: data[0]?.documents,
    //   sampleDoc: data[0]?.documents?.[0]
    // });
    
    // Prepare data for Excel export with document links
    const excelData = data.map(app => {
      // Format document links with URLs
      let documentLinks = '';
      if (app.documents && app.documents.length > 0) {
        documentLinks = app.documents.map((doc, index) => {
          const docName = doc.originalName || doc.name || `Document ${index + 1}`;
          const docType = doc.type ? `[${doc.type}]` : '';
          return `${index + 1}. ${docName} ${docType}`;
        }).join('\n');
      }
      
      return {
        'Full Name': app.fullName || '',
        'Email': app.email || '',
        'Mobile Number': app.mobileNumber || '',
        'PAN Number': app.panNumber || '',
        'Aadhar Number': app.aadharNumber || '',
        'Date of Birth': app.dateOfBirth ? new Date(app.dateOfBirth).toLocaleDateString('en-IN') : '',
        'Address': app.address || '',
        'Employment Type': app.employmentType ? app.employmentType.replace('_', ' ').toUpperCase() : '',
        'Monthly Salary': app.monthlySalary ? `₹${app.monthlySalary.toLocaleString('en-IN')}` : '',
        'Desired Loan Amount': app.desiredLoanAmount ? `₹${app.desiredLoanAmount.toLocaleString('en-IN')}` : '',
        'Loan Amount': app.loanAmount ? `₹${app.loanAmount.toLocaleString('en-IN')}` : '',
        'CIBIL Score': app.cibilScore || '',
        'Application Status': app.applicationStatus || '',
        'Payment Status': app.paymentStatus || '',
        'Documents Count': app.documents ? app.documents.length : 0,
        'Documents': documentLinks || 'No documents',
        'Payments Count': app.payments ? app.payments.length : 0,
        'Application Date': app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN') : '',
        '__documents': app.documents || [] // Store for hyperlink processing
      };
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Add hyperlinks to Documents column
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const app = data[row - 1];
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: 15 }); // Column P (Documents)
      
      if (app.documents && app.documents.length > 0) {
        // Create clickable hyperlinks for each document
        const docLinks = app.documents.map((doc, index) => {
          const docName = doc.originalName || doc.name || `Document ${index + 1}`;
          const docType = doc.type ? `[${doc.type}]` : '';
          const downloadUrl = `${baseUrl}/api/documents/download/${doc.id}?applicationId=${app.id}`;
          return `${docName} ${docType}`;
        }).join('\n');
        
        // For Excel, we'll create the first document as a hyperlink
        if (app.documents.length === 1) {
          const doc = app.documents[0];
          const docName = doc.originalName || doc.name || 'Document';
          const downloadUrl = `${baseUrl}/api/documents/download/${doc.id}?applicationId=${app.id}`;
          worksheet[cellAddress] = {
            v: docName,
            l: { Target: downloadUrl, Tooltip: 'Click to download' },
            s: { font: { color: { rgb: '0563C1' }, underline: true } }
          };
        } else {
          // Multiple documents - show text with link instruction
          worksheet[cellAddress] = {
            v: docLinks + '\n\nSee Documents sheet for links',
            s: { alignment: { wrapText: true, vertical: 'top' } }
          };
        }
      }
    }
    
    // Set column widths for proper display
    const columnWidths = [
      { wch: 20 },  // Full Name
      { wch: 30 },  // Email
      { wch: 15 },  // Mobile Number
      { wch: 12 },  // PAN Number
      { wch: 15 },  // Aadhar Number
      { wch: 12 },  // Date of Birth
      { wch: 40 },  // Address
      { wch: 15 },  // Employment Type
      { wch: 18 },  // Monthly Salary
      { wch: 20 },  // Desired Loan Amount
      { wch: 18 },  // Loan Amount
      { wch: 12 },  // CIBIL Score
      { wch: 18 },  // Application Status
      { wch: 15 },  // Payment Status
      { wch: 16 },  // Documents Count
      { wch: 50 },  // Documents (wider for document names)
      { wch: 15 },  // Payments Count
      { wch: 16 }   // Application Date
    ];
    worksheet['!cols'] = columnWidths;
    
    // Create separate Documents sheet with all clickable links
    const documentsData = [];
    const documentLinks = []; // Store URLs separately
    
    data.forEach(app => {
      if (app.documents && app.documents.length > 0) {
        app.documents.forEach((doc, index) => {
          const docName = doc.originalName || doc.name || `Document ${index + 1}`;
          const downloadUrl = `${baseUrl}/api/documents/download/${doc.id}?applicationId=${app.id}`;
          
          documentsData.push({
            'Applicant Name': app.fullName || '',
            'Application ID': app.id || '',
            'Document Name': docName,
            'Document Type': doc.type || '',
            'Download Link': 'LINK' // Placeholder, will be replaced with hyperlink
          });
          
          documentLinks.push(downloadUrl);
        });
      }
    });
    
    // console.log('🔗 Documents to export:', documentsData.length);
    
    // Create Documents worksheet if there are any documents
    let documentsWorksheet = null;
    if (documentsData.length > 0) {
      documentsWorksheet = XLSX.utils.json_to_sheet(documentsData);
      
      // Add clickable hyperlinks using XLSX hyperlink format
      const docRange = XLSX.utils.decode_range(documentsWorksheet['!ref']);
      for (let row = docRange.s.r + 1; row <= docRange.e.r; row++) {
        const dataIndex = row - 1;
        const url = documentLinks[dataIndex];
        const linkCell = XLSX.utils.encode_cell({ r: row, c: 4 }); // Column E (Download Link)
        
        if (url) {
          // Set cell with hyperlink using XLSX format
          documentsWorksheet[linkCell] = {
            t: 's',
            v: 'Click to Download',
            l: { Target: url },
            s: {
              font: { 
                color: { rgb: '0563C1' },
                underline: true 
              }
            }
          };
        }
      }
      
      // Set column widths for Documents sheet
      documentsWorksheet['!cols'] = [
        { wch: 25 },  // Applicant Name
        { wch: 15 },  // Application ID
        { wch: 40 },  // Document Name
        { wch: 15 },  // Document Type
        { wch: 20 }   // Download Link
      ];
    }
    
    // Create workbook and add worksheets
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Loan Applications');
    if (documentsWorksheet) {
      XLSX.utils.book_append_sheet(workbook, documentsWorksheet, 'Documents');
    }
    
    // Generate Excel file and download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Loan_Applications_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRefresh = useCallback(() => {
    // Force refresh when user explicitly clicks refresh
    // console.log('🔄 Force refreshing loan applications');
    dispatch(fetchLoanApplicationsThunk({ forceRefresh: true }));
  }, [dispatch]);

  return (
    <LoanApplicationsDataTable
      applications={applications}
      loading={loading}
      onRefresh={handleRefresh}
      onExport={handleExport}
      onCreateApplication={() => {}}
      onEditApplication={() => {}}
      onViewApplication={() => {}}
      onDeleteApplication={() => {}}
    />
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText, Download, Eye, Search, Filter, Loader2, ChevronDown, ChevronRight, User } from 'lucide-react';
import { downloadDocumentThunk, viewDocumentThunk } from '@/redux/Loan_Application/loanThunks';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const documentTypeOptions = [
  { label: 'All Types', value: 'all' },
  { label: 'Identity', value: 'identity' },
  { label: 'Financial', value: 'financial' },
  { label: 'Address Proof', value: 'address' },
  { label: 'Income Proof', value: 'income' }
];

const getTypeColor = (type) => {
  const colors = {
    identity: 'bg-blue-100 text-blue-800',
    financial: 'bg-green-100 text-green-800',
    address: 'bg-purple-100 text-purple-800',
    income: 'bg-orange-100 text-orange-800',
    default: 'bg-gray-100 text-gray-800'
  };
  return colors[type] || colors.default;
};

export default function DocumentsTable({ applications = [], loading = false }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const applicationIdFromUrl = searchParams.get('applicationId');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewingDocument, setViewingDocument] = useState(null);
  const [downloading, setDownloading] = useState(new Set());
  const [expandedApplications, setExpandedApplications] = useState(new Set());

  // Group applications with their documents
  const applicationsWithDocuments = applications.map(app => ({
    ...app,
    documents: (app.documents || []).map(doc => ({
      ...doc,
      name: doc.originalName || doc.name,
    }))
  })).filter(app => app.documents.length > 0); // Only show apps with documents

  // For stats - flatten all documents
  const allDocuments = applicationsWithDocuments.flatMap(app => 
    app.documents.map(doc => ({
      ...doc,
      applicationId: app.id,
      applicantName: app.fullName,
      applicationStatus: app.applicationStatus
    }))
  );

  // Filter applications with documents
  const filteredApplications = applicationsWithDocuments.filter(app => {
    // Filter by applicationId from URL if present
    if (applicationIdFromUrl && app.id.toString() !== applicationIdFromUrl) {
      return false;
    }

    // Check if application matches search term
    const matchesSearch = searchTerm === '' ||
      app.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.mobileNumber?.includes(searchTerm) ||
      app.documents.some(doc => doc.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Check if any document matches type filter
    const hasMatchingType = typeFilter === 'all' || 
      app.documents.some(doc => doc.type === typeFilter);
    
    return matchesSearch && hasMatchingType;
  });

  // Get total filtered documents count for stats
  const filteredDocuments = filteredApplications.flatMap(app => 
    app.documents.filter(doc => typeFilter === 'all' || doc.type === typeFilter)
  );

  // Toggle application expansion
  const toggleApplication = (appId) => {
    setExpandedApplications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(appId)) {
        newSet.delete(appId);
      } else {
        newSet.add(appId);
      }
      return newSet;
    });
  };

  // Expand all applications by default if filtering by specific application
  useEffect(() => {
    if (applicationIdFromUrl) {
      setExpandedApplications(new Set([parseInt(applicationIdFromUrl)]));
    }
  }, [applicationIdFromUrl]);

  // Handle document view
  const handleViewDocument = async (doc, applicationId) => {
    console.log('🔍 Viewing document:', { 
      documentId: doc.id, 
      applicationId: applicationId, 
      documentName: doc.name,
      documentPath: doc.path,
      fullDoc: doc 
    });
    try {
      await dispatch(viewDocumentThunk({
        documentId: doc.id,
        applicationId: applicationId,
        documentName: doc.name,
        documentPath: doc.path || doc.filePath || doc.url // This contains the full path with timestamped filename
      })).unwrap();
      
      // Document opens in new tab automatically from the thunk
      // No need to show modal or handle the result here
      console.log('✅ Document opened in new tab');
      
    } catch (error) {
      console.error('❌ View document error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to view document',
        variant: 'destructive',
      });
    }
  };

  // Handle document download
  const handleDownloadDocument = async (doc, applicationId) => {
    console.log('⬇️ Downloading document:', { 
      documentId: doc.id, 
      applicationId: applicationId, 
      documentName: doc.name,
      documentPath: doc.path,
      fullDoc: doc 
    });
    
    // Validate required parameters
    if (!doc.id) {
      console.error('❌ Missing document ID');
      toast({
        title: 'Error',
        description: 'Document ID is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!applicationId) {
      console.error('❌ Missing application ID');
      toast({
        title: 'Error',
        description: 'Application ID is required',
        variant: 'destructive',
      });
      return;
    }
    
    const docKey = `${applicationId}-${doc.id}`;
    setDownloading(prev => new Set([...prev, docKey]));
    
    try {
      const result = await dispatch(downloadDocumentThunk({
        documentId: doc.id,
        applicationId: applicationId,
        documentName: doc.name,
        documentPath: doc.path || doc.filePath || doc.url // This contains the full path with timestamped filename
      })).unwrap();
      
      console.log('✅ Download document result:', result);
      
      toast({
        title: 'Success',
        description: 'Document downloaded successfully',
      });
    } catch (error) {
      console.error('❌ Download document error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to download document',
        variant: 'destructive',
      });
    } finally {
      setDownloading(prev => {
        const newSet = new Set(prev);
        newSet.delete(docKey);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-[250px] bg-muted animate-pulse rounded" />
            <div className="h-8 w-[120px] bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="rounded-md border">
          <div className="h-[400px] animate-pulse bg-muted/50" />
        </div>
      </div>
    );
  }

  // Get application name for filtered view
  const filteredApplication = applicationIdFromUrl ? 
    applications.find(app => app.id.toString() === applicationIdFromUrl) : null;

  // Stats by document type
  const documentStats = {
    identity: filteredDocuments.filter(d => d.type === 'identity').length,
    financial: filteredDocuments.filter(d => d.type === 'financial').length,
    address: filteredDocuments.filter(d => d.type === 'address').length,
    income: filteredDocuments.filter(d => d.type === 'income').length,
  };

  return (
    <div className="space-y-4">
      {/* Application Filter Header */}
      {applicationIdFromUrl && filteredApplication && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                Documents for: {filteredApplication.fullName}
              </h3>
              <p className="text-xs text-blue-700">
                Application ID: {applicationIdFromUrl} • Mobile: {filteredApplication.mobileNumber}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-8 w-[250px]"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 w-[120px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {documentTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(searchTerm || typeFilter !== 'all') && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
              }}
              className="h-8 px-2 lg:px-3"
            >
              Reset
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredDocuments.length} documents found
        </div>
      </div>

      {/* Documents Table (Grouped by Application) */}
      <div className="rounded-md border">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">Application</TableHead>
              <TableHead className="w-1/4">Applicant</TableHead>
              <TableHead className="w-2/5">Documents</TableHead>
              <TableHead className="w-1/6">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">No documents found</h3>
                    <p className="text-muted-foreground">
                      {allDocuments.length === 0
                        ? "No documents have been uploaded yet."
                        : "No documents match your current filters."
                      }
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="align-top">
                    <div className="flex items-start space-x-2 pt-1">
                      <button
                        className="p-1 rounded hover:bg-muted mt-0.5 flex-shrink-0"
                        onClick={() => toggleApplication(app.id)}
                        title={expandedApplications.has(app.id) ? 'Collapse' : 'Expand'}
                      >
                        {expandedApplications.has(app.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      <div className="flex items-center space-x-2 min-w-0">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium truncate">{app.fullName}</div>
                          <div className="text-xs text-muted-foreground">App ID: {app.id}</div>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="text-sm pt-1">
                      <div className="truncate">{app.email}</div>
                      <div className="text-muted-foreground truncate">{app.mobileNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="w-full">
                      {expandedApplications.has(app.id) ? (
                        app.documents.length === 0 ? (
                          <div className="text-sm text-muted-foreground">No documents</div>
                        ) : (
                          <div className="grid gap-2">
                            {app.documents
                              .filter(doc => typeFilter === 'all' || doc.type === typeFilter)
                              .map((doc) => (
                                <div key={`${app.id}-${doc.id}`} className="flex items-center justify-between rounded border p-2 bg-muted/20">
                                  <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                    <div className="min-w-0">
                                      <div className="text-sm font-medium truncate">{doc.name}</div>
                                      <div className="text-xs text-muted-foreground capitalize">{doc.type}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1 flex-shrink-0">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleViewDocument(doc, app.id)}
                                      title="View document in new tab"
                                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-8 w-8 p-0"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleDownloadDocument(doc, app.id)}
                                      disabled={downloading.has(`${app.id}-${doc.id}`)}
                                      title={downloading.has(`${app.id}-${doc.id}`) ? "Downloading..." : "Download document to your device"}
                                      className="text-green-600 hover:text-green-800 hover:bg-green-50 h-8 w-8 p-0"
                                    >
                                      {downloading.has(`${app.id}-${doc.id}`) ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Download className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                            ))}
                          </div>
                        )
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {app.documents.length} document{app.documents.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="pt-1">
                      <Badge 
                        className={`
                          ${app.applicationStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            app.applicationStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            app.applicationStatus === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          } border-0
                        `}
                      >
                        {app.applicationStatus}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      {filteredApplications.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
          <div>
            Showing {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''} with {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center space-x-4">
            <div>Identity: {documentStats.identity}</div>
            <div>Financial: {documentStats.financial}</div>
            <div>Address: {documentStats.address}</div>
            <div>Income: {documentStats.income}</div>
          </div>
        </div>
      )}

      {/* Document Viewing Dialog */}
      <Dialog open={!!viewingDocument} onOpenChange={() => setViewingDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{viewingDocument?.name}</DialogTitle>
            <DialogDescription>
              {viewingDocument?.applicantName} - {viewingDocument?.type?.toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {viewingDocument?.mimeType?.includes('image') ? (
              <img 
                src={viewingDocument.url} 
                alt={viewingDocument.name}
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
                onError={(e) => {
                  e.target.src = '/placeholder-document.svg';
                }}
              />
            ) : (
              <div className="text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Document opened in new tab
                </p>
                <Button onClick={() => setViewingDocument(null)}>
                  Close
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

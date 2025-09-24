'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormSelect } from '@/components/forms/form-select';
import { useForm } from 'react-hook-form';
import { 
  Upload, 
  X, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  Image,
  FileType
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DOCUMENT_TYPES = [
  { label: 'PAN Card', value: 'panCard' },
  { label: 'Aadhar Card', value: 'aadharCard' },
  { label: 'Bank Statement', value: 'bankStatement' },
  { label: 'User Photo', value: 'userPhoto' }
  // { label: 'Salary Slip', value: 'salarySlip' },
  // { label: 'Address Proof', value: 'addressProof' },
  // { label: 'Other', value: 'other' }
];

const DOCUMENT_TYPE_VALIDATIONS = {
  bankStatement: {
    allowedTypes: ['application/pdf'],
    maxSize: 5 * 1024 * 1024, // 5MB
    description: 'Bank statement must be a PDF file'
  },
  panCard: {
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    maxSize: 5 * 1024 * 1024, // 5MB
    description: 'PAN card can be JPEG, PNG, or PDF format'
  },
  aadharCard: {
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    maxSize: 5 * 1024 * 1024, // 5MB
    description: 'Aadhar card can be JPEG, PNG, or PDF format'
  },
  userPhoto: {
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    maxSize: 2 * 1024 * 1024, // 2MB
    description: 'User photo must be JPEG or PNG format'
  },
  default: {
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    maxSize: 5 * 1024 * 1024, // 5MB
    description: 'File can be JPEG, PNG, or PDF format'
  }
};

export default function DocumentUpload({ 
  documents, 
  onDocumentsChange, 
  disabled = false,
  showTitle = true,
  existingDocuments = [] // For edit mode
}) {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const form = useForm();

  const [dragActive, setDragActive] = useState(false);

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-500" />;
    } else if (mimeType === 'application/pdf') {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    return <FileType className="h-4 w-4 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file, documentType) => {
    const validation = DOCUMENT_TYPE_VALIDATIONS[documentType] || DOCUMENT_TYPE_VALIDATIONS.default;
    
    // Check file type
    if (!validation.allowedTypes.includes(file.type)) {
      return `Invalid file type. ${validation.description}`;
    }
    
    // Check file size
    if (file.size > validation.maxSize) {
      return `File size too large. Maximum ${formatFileSize(validation.maxSize)} allowed.`;
    }
    
    return null;
  };

  const addDocument = (file, type) => {
    const error = validateFile(file, type);
    if (error) {
      toast({
        title: 'File Validation Error',
        description: error,
        variant: 'destructive',
      });
      return;
    }

    // Check if document type already exists
    const existingDoc = documents.find(doc => doc.type === type);
    if (existingDoc) {
      toast({
        title: 'Document Type Exists',
        description: `A ${DOCUMENT_TYPES.find(t => t.value === type)?.label} document is already uploaded. Please remove it first.`,
        variant: 'destructive',
      });
      return;
    }

    const newDocument = {
      id: Date.now() + Math.random(), // Temporary ID for UI
      file,
      type,
      name: file.name,
      size: file.size,
      mimeType: file.type,
      isNew: true
    };

    onDocumentsChange([...documents, newDocument]);
    
    toast({
      title: 'Document Added',
      description: `${DOCUMENT_TYPES.find(t => t.value === type)?.label} uploaded successfully.`,
    });
  };

  const removeDocument = (documentId) => {
    const updatedDocuments = documents.filter(doc => doc.id !== documentId);
    onDocumentsChange(updatedDocuments);
    
    toast({
      title: 'Document Removed',
      description: 'Document has been removed from the upload list.',
    });
  };

  const handleFileSelect = (files, documentType) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    addDocument(file, documentType);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e, documentType) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files, documentType);
    }
  };

  const handleFileInputChange = (e, documentType) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files, documentType);
    }
    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {showTitle && (
        <div>
          <h3 className="text-lg font-semibold">Document Upload</h3>
          <p className="text-sm text-muted-foreground">
            Upload required documents for the loan application. Maximum file size is 5MB per document.
          </p>
        </div>
      )}

      {/* Existing Documents (for edit mode) */}
      {existingDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Existing Documents</CardTitle>
            <CardDescription>Documents already uploaded for this application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {existingDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center space-x-2">
                  {getFileIcon(doc.mimeType)}
                  <div>
                    <div className="text-sm font-medium">{doc.originalName || doc.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {DOCUMENT_TYPES.find(t => t.value === doc.type)?.label || doc.type}
                      {doc.fileSize && ` • ${formatFileSize(doc.fileSize)}`}
                    </div>
                  </div>
                </div>
                <Badge variant="secondary">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Uploaded
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Individual Document Upload Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOCUMENT_TYPES.map((docType) => {
          const existingDoc = documents.find(doc => doc.type === docType.value);
          const existingUploadedDoc = existingDocuments.find(doc => doc.type === docType.value);
          const validation = DOCUMENT_TYPE_VALIDATIONS[docType.value] || DOCUMENT_TYPE_VALIDATIONS.default;
          
          return (
            <Card key={docType.value} className={`${existingDoc || existingUploadedDoc ? 'border-green-200 bg-green-50' : ''}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  {docType.label}
                  {(existingDoc || existingUploadedDoc) && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </CardTitle>
                <CardDescription className="text-xs">
                  {validation.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {existingUploadedDoc ? (
                  // Show existing uploaded document
                  <div className="text-center p-4 border border-green-200 rounded-lg bg-green-50">
                    {getFileIcon(existingUploadedDoc.mimeType)}
                    <div className="mt-2">
                      <p className="text-sm font-medium text-green-800">{existingUploadedDoc.originalName || existingUploadedDoc.name}</p>
                      <p className="text-xs text-green-600">Already uploaded</p>
                    </div>
                  </div>
                ) : existingDoc ? (
                  // Show new document to be uploaded
                  <div className="text-center p-4 border border-orange-200 rounded-lg bg-orange-50">
                    {getFileIcon(existingDoc.mimeType)}
                    <div className="mt-2">
                      <p className="text-sm font-medium text-orange-800">{existingDoc.name}</p>
                      <p className="text-xs text-orange-600">Ready to upload</p>
                      {!disabled && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(existingDoc.id)}
                          className="mt-2 h-6 text-xs"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  // Show upload area
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
                      dragActive 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={(e) => handleDrop(e, docType.value)}
                    onClick={() => {
                      if (!disabled) {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.jpg,.jpeg,.png,.pdf';
                        input.onchange = (e) => handleFileInputChange(e, docType.value);
                        input.click();
                      }
                    }}
                  >
                    <div className="text-center">
                      <Upload className={`mx-auto h-8 w-8 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="mt-2">
                        <p className="text-xs font-medium">
                          {dragActive ? 'Drop here' : 'Click or drag to upload'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>


      {/* Upload Summary */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Upload Summary</CardTitle>
            <CardDescription>{documents.length} document{documents.length !== 1 ? 's' : ''} ready to upload</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
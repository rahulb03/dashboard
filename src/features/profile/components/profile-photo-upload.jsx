'use client';
import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X } from 'lucide-react';
import { updateProfilePhoto } from '@/redux/auth/authThunks';
import { useToast } from '@/hooks/use-toast';
import { IMAGE_URL } from '@/config/constant';

export default function ProfilePhotoUpload({ user, className = '' }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (JPG, PNG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      await dispatch(updateProfilePhoto(selectedFile)).unwrap();
      toast({
        title: 'Success',
        description: 'Profile photo updated successfully',
      });
      setPreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error || 'Failed to update profile photo',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getProfilePhotoUrl = () => {
    if (preview) return preview;
    if (user?.profilePhoto) {
      // Check if it's already a full URL
      if (user.profilePhoto.startsWith('http')) {
        return user.profilePhoto;
      }
      // Otherwise, prepend the base URL
      return `${IMAGE_URL}${user.profilePhoto}`;
    }
    return null;
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="relative">
        <Avatar className="h-32 w-32">
          <AvatarImage src={getProfilePhotoUrl()} alt={user?.name || 'User'} />
          <AvatarFallback className="text-3xl">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
        {!preview && (
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-0 right-0 rounded-full h-10 w-10"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Camera className="h-5 w-5" />
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview && selectedFile && (
        <div className="flex gap-2">
          <Button
            onClick={handleUpload}
            disabled={uploading}
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
          <Button
            onClick={handleCancel}
            disabled={uploading}
            variant="outline"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}

      {!preview && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Camera className="h-4 w-4 mr-2" />
          Change Photo
        </Button>
      )}
    </div>
  );
}

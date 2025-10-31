import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  type: string;
}

interface ReportUploadProps {
  onUploadComplete: (files: UploadedFile[]) => void;
}

export const ReportUpload = ({ onUploadComplete }: ReportUploadProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [reportType, setReportType] = useState("fg_completion"); // Default to FG Completion
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const processFiles = useCallback(async (fileList: File[]) => {
    if (!reportType) {
      toast({
        title: "Missing Information",
        description: "Please select report type before uploading",
        variant: "destructive",
      });
      return;
    }

    const newFiles: UploadedFile[] = fileList.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      status: 'uploading' as const,
      progress: 0,
      type: reportType
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Process each file
    for (let i = 0; i < fileList.length; i++) {
      const originalFile = fileList[i];
      const uploadedFile = newFiles[i];

      try {
        // Update progress
        setFiles(prev => prev.map(f =>
          f.id === uploadedFile.id
            ? { ...f, status: 'uploading' as const, progress: 30 }
            : f
        ));

        // Handle FG Completion CSV uploads
        if (reportType === 'fg_completion') {
          const formData = new FormData();
          formData.append('file', originalFile);

          setFiles(prev => prev.map(f =>
            f.id === uploadedFile.id
              ? { ...f, progress: 50 }
              : f
          ));

          const response = await fetch('/api/upload-fg-completion', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Upload failed');
          }

          const result = await response.json();

          setFiles(prev => prev.map(f =>
            f.id === uploadedFile.id
              ? { ...f, status: 'completed' as const, progress: 100 }
              : f
          ));

          toast({
            title: "File Processed Successfully",
            description: `Successfully uploaded ${result.recordsUploaded} records from ${originalFile.name}`,
          });
        } else {
          // Simulate file upload and processing for other report types
          const uploadInterval = setInterval(() => {
            setFiles(prev => prev.map(f =>
              f.id === uploadedFile.id
                ? { ...f, progress: Math.min(f.progress + 10, 90) }
                : f
            ));
          }, 200);

          setTimeout(() => {
            clearInterval(uploadInterval);
            setFiles(prev => prev.map(f =>
              f.id === uploadedFile.id
                ? { ...f, status: 'processing' as const, progress: 0 }
                : f
            ));

            const processInterval = setInterval(() => {
              setFiles(prev => prev.map(f =>
                f.id === uploadedFile.id
                  ? { ...f, progress: Math.min(f.progress + 15, 100) }
                  : f
              ));
            }, 300);

            setTimeout(() => {
              clearInterval(processInterval);
              setFiles(prev => prev.map(f =>
                f.id === uploadedFile.id
                  ? { ...f, status: 'completed' as const, progress: 100 }
                  : f
              ));

              toast({
                title: "File Processed",
                description: `${originalFile.name} has been successfully processed`,
              });
            }, 2000);
          }, 2000);
        }
      } catch (error) {
        setFiles(prev => prev.map(f =>
          f.id === uploadedFile.id
            ? { ...f, status: 'error' as const }
            : f
        ));

        toast({
          title: "Upload Failed",
          description: error instanceof Error ? error.message : 'Failed to upload file',
          variant: "destructive",
        });
      }
    }

    onUploadComplete(newFiles);
  }, [reportType, toast, onUploadComplete]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, [processFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      default:
        return 'Pending';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-5 h-5 text-primary" />
          <span>Report Upload</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Configuration */}
        <div className="space-y-2">
          <Label>Report Type</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fg_completion">FG Completion Report (CSV)</SelectItem>
              <SelectItem value="daily">Daily Progress Report</SelectItem>
              <SelectItem value="weekly">Weekly Summary</SelectItem>
              <SelectItem value="monthly">Monthly Report</SelectItem>
              <SelectItem value="production">Production Report</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* File Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50'
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Drop files here or click to browse</h3>
          <p className="text-muted-foreground mb-4">
            {reportType === 'fg_completion'
              ? 'Upload CSV file for FG Completion Report (up to 50MB)'
              : 'Supports PDF, Excel, CSV, and image files up to 50MB each'
            }
          </p>
          <Input
            type="file"
            multiple
            accept={reportType === 'fg_completion' ? '.csv' : '.pdf,.xlsx,.xls,.csv,.jpg,.jpeg,.png'}
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <Button asChild>
            <label htmlFor="file-upload" className="cursor-pointer">
              Choose Files
            </label>
          </Button>
        </div>

        {/* Uploaded Files List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Uploaded Files</h3>
            {files.map((file) => (
              <div key={file.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                {getStatusIcon(file.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <div className="flex items-center space-x-3 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {file.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {getStatusText(file.status)}
                    </span>
                  </div>
                  {(file.status === 'uploading' || file.status === 'processing') && (
                    <Progress value={file.progress} className="mt-2 h-1" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(file.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
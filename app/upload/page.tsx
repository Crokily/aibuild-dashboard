"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    summary?: {
      productsProcessed: number;
      recordsCreated: number;
    };
  } | null>(null);
  
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setUploadResult({
        success: false,
        message: "Please select a file to upload"
      });
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResult({
          success: true,
          message: result.message || "File uploaded successfully",
          summary: result.summary
        });
        
        // Reset form
        setFile(null);
        const fileInput = document.getElementById("file-upload") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        
      } else {
        setUploadResult({
          success: false,
          message: result.error || "Upload failed"
        });
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message: "Network error occurred. Please try again."
      });
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Upload Data</h1>
          <p className="text-muted-foreground">
            Import your product data from Excel files to visualize trends
          </p>
        </div>

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Excel File Upload
            </CardTitle>
            <CardDescription>
              Upload an Excel file (.xlsx or .xls) containing product data with procurement, sales, and inventory information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select Excel File</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
                
                {file && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <FileText className="w-4 h-4" />
                    <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                )}
              </div>

              {/* Upload Result */}
              {uploadResult && (
                <div className={`p-4 rounded-lg border ${
                  uploadResult.success 
                    ? "bg-green-50 border-green-200 text-green-800" 
                    : "bg-red-50 border-red-200 text-red-800"
                }`}>
                  <div className="flex items-start gap-2">
                    {uploadResult.success ? (
                      <CheckCircle className="w-5 h-5 mt-0.5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 mt-0.5 text-red-600" />
                    )}
                    <div className="space-y-1">
                      <p className="font-medium">{uploadResult.message}</p>
                      {uploadResult.success && uploadResult.summary && (
                        <div className="text-sm">
                          <p>• Products processed: {uploadResult.summary.productsProcessed}</p>
                          <p>• Records created: {uploadResult.summary.recordsCreated}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={!file || isUploading}
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload File
                    </>
                  )}
                </Button>
                
                {uploadResult?.success && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                  >
                    View Dashboard
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* File Format Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expected File Format</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Your Excel file should contain the following columns:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <p className="font-medium">Required Columns:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>ID (Product Code)</li>
                  <li>Product Name</li>
                  <li>Opening Inventory</li>
                </ul>
              </div>
              <div className="space-y-1">
                <p className="font-medium">Daily Columns (Day 1, 2, 3...):</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Procurement Qty (Day X)</li>
                  <li>Procurement Price (Day X)</li>
                  <li>Sales Qty (Day X)</li>
                  <li>Sales Price (Day X)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

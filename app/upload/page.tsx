"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

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
  const [isDragOver, setIsDragOver] = useState(false);

  const router = useRouter();

  const acceptExt = [".xlsx", ".xls"] as const;
  const acceptMime = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];

  const validateFile = (f: File | null): string | null => {
    if (!f) return "No file selected";
    const name = f.name.toLowerCase();
    const hasExt = acceptExt.some((ext) => name.endsWith(ext));
    const hasMime = acceptMime.includes(f.type);
    if (!hasExt && !hasMime) return "Only .xlsx or .xls files are allowed";
    const maxMB = 50;
    if (f.size > maxMB * 1024 * 1024) return `File must be <= ${maxMB}MB`;
    return null;
  };

  const setValidatedFile = (f: File | null) => {
    const err = validateFile(f);
    if (err) {
      setFile(null);
      setUploadResult({ success: false, message: err });
    } else {
      setFile(f);
      setUploadResult(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    setValidatedFile(selectedFile);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setUploadResult({ success: false, message: "Please select a file to upload" });
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const result = await response.json();

      if (response.ok) {
        setUploadResult({
          success: true,
          message: result.message || "File uploaded successfully",
          summary: result.summary,
        });

        // Reset form
        setFile(null);
        const fileInput = document.getElementById("file-upload") as HTMLInputElement | null;
        if (fileInput) fileInput.value = "";
      } else {
        setUploadResult({ success: false, message: result.error || "Upload failed" });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadResult({ success: false, message: "Network error occurred. Please try again." });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Breadcrumb */}
        <div className="-mt-2">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Import Your Data</h1>
          <p className="text-muted-foreground">
            Import your product data from Excel files to visualize trends
          </p>
        </div>

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Excel File Upload
            </CardTitle>
            <CardDescription>
              Upload an Excel file (.xlsx or .xls) containing product data with procurement, sales, and inventory information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="space-y-2">

                {/* Hidden native input to avoid inconsistent browser styling */}
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="sr-only"
                />

                {/* Large dropzone area */}
                <label
                  htmlFor="file-upload"
                  onDragOver={(ev) => {
                    ev.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(ev) => {
                    ev.preventDefault();
                    setIsDragOver(false);
                    const dropped = ev.dataTransfer?.files?.[0] ?? null;
                    setValidatedFile(dropped);
                  }}
                  className={`flex h-56 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-colors ${
                    isDragOver ? "bg-accent/60" : "hover:bg-accent/40"
                  } ${isUploading ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                    <Upload className="h-7 w-7 text-primary" />
                  </div>
                  <p className="text-base font-medium">
                    {file ? "Drop another file to replace" : "Drop your Excel file here"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    · .xlsx or .xls · Max ~50MB
                  </p>
                </label>

                {file && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
              </div>

              {/* Upload Result */}
              {uploadResult && (
                <div
                  className={`rounded-lg border p-4 ${
                    uploadResult.success
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-red-200 bg-red-50 text-red-800"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {uploadResult.success ? (
                      <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                    )}
                    <div className="space-y-1">
                      <p className="font-medium">{uploadResult.message}</p>
                      {uploadResult.success && uploadResult.summary && (
                        <div className="text-sm">
                          <p>Products processed: {uploadResult.summary.productsProcessed}</p>
                          <p>Records created: {uploadResult.summary.recordsCreated}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button type="submit" disabled={!file || isUploading} className="flex-1">
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" /> Upload File
                    </>
                  )}
                </Button>

                {uploadResult?.success && (
                  <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
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
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div className="space-y-1">
                <p className="font-medium">Required Columns:</p>
                <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                  <li>ID (Product Code)</li>
                  <li>Product Name</li>
                  <li>Opening Inventory</li>
                </ul>
              </div>
              <div className="space-y-1">
                <p className="font-medium">Daily Columns (Day 1, 2, 3...):</p>
                <ul className="list-inside list-disc space-y-1 text-muted-foreground">
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

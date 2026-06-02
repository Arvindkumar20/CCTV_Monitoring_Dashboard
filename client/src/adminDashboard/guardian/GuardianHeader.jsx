import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Upload,
  FileUp,
  Download,
  FileSpreadsheet,
  Eye,
  X,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as XLSX from "xlsx";

export const GuardianHeader = ({
  title,
  description,
  totalCount = 0,
  onFileUpload,
  isUploading = false,
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [showSampleDialog, setShowSampleDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);

  // Sample data - FIXED: Correct field names
  const sampleData = [
    {
      "Guardian Name": "Mahesh Singh",
      "Student Name": "Rohan Singh",
      "Mobile": "9876543210",
      "DOB": "15-05-2010",
      "Class": "10th Class",
      "Section": "Section A",
      "Group": "Science",
      "Email": "mahesh.singh@example.com",
      "Relationship": "Father"
    },
    {
      "Guardian Name": "Anjali Kapoor",
      "Student Name": "Sana Kapoor",
      "Mobile": "9123456789",
      "DOB": "20-08-2008",
      "Class": "12th Class",
      "Section": "Section B",
      "Group": "Commerce",
      "Email": "anjali.kapoor@example.com",
      "Relationship": "Mother"
    },
    {
      "Guardian Name": "Rajesh Kumar",
      "Student Name": "Amit Kumar",
      "Mobile": "9988776655",
      "DOB": "12-05-2012",
      "Class": "8th Class",
      "Section": "Section C",
      "Group": "",
      "Email": "rajesh.kumar@example.com",
      "Relationship": "Father"
    },
    {
      "Guardian Name": "Sunita Sharma",
      "Student Name": "Priya Sharma",
      "Mobile": "9876543120",
      "DOB": "05-11-2009",
      "Class": "9th Class",
      "Section": "Section A",
      "Group": "",
      "Email": "sunita.sharma@example.com",
      "Relationship": "Mother"
    },
    {
      "Guardian Name": "Amit Patel",
      "Student Name": "Kavya Patel",
      "Mobile": "9876512345",
      "DOB": "10-02-2011",
      "Class": "7th Class",
      "Section": "Section B",
      "Group": "",
      "Email": "amit.patel@example.com",
      "Relationship": "Father"
    }
  ];

  // Handle file selection - MODIFIED: Sirf 2 users ka preview
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadError(null);
    setSelectedFile(file);

    // Preview file content
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        // MODIFIED: Sirf 3 rows preview (header + 2 data rows)
        const preview = jsonData.slice(0, 3); // Header + 2 users
        setUploadPreview(preview);
      } catch (error) {
        setUploadError("Failed to preview file");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file");
      return;
    }

    try {
      if (onFileUpload) {
        await onFileUpload(selectedFile);
      }
      setShowUploadDialog(false);
      setSelectedFile(null);
      setUploadPreview(null);
      setUploadError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setUploadError(error.message || "Failed to upload file");
    }
  };

  // Handle download sample
  const handleDownloadSample = (format) => {
    try {
      if (format === "excel") {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(sampleData);
        XLSX.utils.book_append_sheet(wb, ws, "Sample Data");
        XLSX.writeFile(wb, "guardian_sample_data.xlsx");
      } else {
        // CSV format
        const ws = XLSX.utils.json_to_sheet(sampleData);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "guardian_sample_data.csv";
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Download failed:", error);
      setUploadError("Failed to download sample file");
    }
  };

  // Handle cancel upload
  const handleCancelUpload = () => {
    setShowUploadDialog(false);
    setSelectedFile(null);
    setUploadPreview(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">{description}</p>
          {totalCount > 0 && (
            <p className="text-xs text-blue-600 mt-1 font-medium">
              Total Guardians: {totalCount}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Bulk Upload Button */}
          <Button
            variant="outline"
            onClick={() => setShowUploadDialog(true)}
            className="px-4 py-2.5 border-slate-300 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition-all"
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>

          {/* View Sample Data Button */}
          <Button
            variant="ghost"
            onClick={() => setShowSampleDialog(true)}
            className="px-4 py-2.5 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition-all"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Sample
          </Button>

          {/* Add Guardian Button */}
          <Button
            onClick={() => navigate("/dashboard/guardians/add")}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Guardian
          </Button>
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Bulk Upload Guardians
            </DialogTitle>
            <DialogDescription>
              Upload Excel or CSV file with guardian data
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* File Input */}
            <div
              className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".xlsx,.xls,.csv"
                className="hidden"
              />
              <FileUp className="w-12 h-12 mx-auto text-slate-400 mb-3" />
              <p className="text-sm font-medium text-slate-700">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supported formats: .xlsx, .xls, .csv (Max 5MB)
              </p>
            </div>

            {/* Selected File Info */}
            {selectedFile && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setSelectedFile(null);
                      setUploadPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* File Preview - MODIFIED: Sirf 2 users scrollable */}
                {uploadPreview && uploadPreview.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-slate-600">
                        Preview (showing first 2 records):
                      </p>
                      {uploadPreview.length > 3 && (
                        <p className="text-xs text-blue-600">
                          +{uploadPreview.length - 3} more records
                        </p>
                      )}
                    </div>
                    <div className="overflow-x-auto max-h-[200px] overflow-y-auto border border-slate-200 rounded-lg">
                      <table className="min-w-full text-xs">
                        <thead className="bg-slate-100 sticky top-0 z-10">
                          <tr>
                            {uploadPreview[0]?.map((header, i) => (
                              <th key={i} className="px-3 py-2 border text-left font-medium whitespace-nowrap">
                                {header || `Column ${i + 1}`}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {uploadPreview.slice(1, 3).map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              {row.map((cell, j) => (
                                <td key={j} className="px-3 py-2 border whitespace-nowrap">
                                  {cell || '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                          {/* Show remaining count if more records exist */}
                          {uploadPreview.length > 3 && (
                            <tr>
                              <td 
                                colSpan={uploadPreview[0]?.length || 1} 
                                className="px-3 py-2 text-center text-slate-500 bg-slate-50 italic"
                              >
                                ... and {uploadPreview.length - 3} more records
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {uploadError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            {/* Download Sample Section */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="text-sm font-medium text-slate-700 mb-2">
                Don't have a template?
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadSample("excel")}
                  className="text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Sample Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadSample("csv")}
                  className="text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Sample CSV
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancelUpload}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sample Data Dialog */}
      <Dialog open={showSampleDialog} onOpenChange={setShowSampleDialog}>
        <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Sample Guardian Data
            </DialogTitle>
            <DialogDescription>
              Preview of the expected data format for bulk upload
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="json">JSON View</TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="mt-2">
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                        Guardian Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                        Student Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                        Mobile
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                        DOB
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                        Class
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                        Section
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                        Group
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                        Email
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {sampleData.map((row, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-4 py-2">{row["Guardian Name"]}</td>
                        <td className="px-4 py-2">{row["Student Name"]}</td>
                        <td className="px-4 py-2">{row.Mobile}</td>
                        <td className="px-4 py-2">{row.DOB}</td>
                        <td className="px-4 py-2">{row.Class}</td>
                        <td className="px-4 py-2">{row.Section}</td>
                        <td className="px-4 py-2">
                          {row.Group || <span className="text-slate-400">—</span>}
                        </td>
                        <td className="px-4 py-2">{row.Email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="json" className="mt-2">
              <pre className="bg-slate-50 p-4 rounded-lg overflow-x-auto text-xs border">
                {JSON.stringify(sampleData, null, 2)}
              </pre>
            </TabsContent>
          </Tabs>

          <div className="bg-blue-50 p-4 rounded-lg mt-4 border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Important Notes:
            </h4>
            <ul className="list-disc list-inside text-xs text-blue-700 space-y-1">
              <li>All fields except Group and Email are required</li>
              <li>Mobile numbers must be 10 digits starting with 6-9</li>
              <li>DOB must be in DD-MM-YYYY format (e.g., 15-05-2010)</li>
              <li>Class and Section will be auto-created if they don't exist</li>
              <li>Password is auto-generated from Student Name + DOB</li>
              <li>Duplicate mobile numbers will be skipped automatically</li>
            </ul>
          </div>

          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => handleDownloadSample("excel")}
              className="text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Download Excel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDownloadSample("csv")}
              className="text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Download CSV
            </Button>
            <Button onClick={() => setShowSampleDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Header Skeleton
export const GuardianHeaderSkeleton = () => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div className="space-y-2">
      <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
      <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />
      <div className="h-3 w-32 bg-slate-200 rounded animate-pulse mt-1" />
    </div>
    <div className="flex items-center gap-3">
      <div className="h-10 w-28 bg-slate-200 rounded-xl animate-pulse" />
      <div className="h-10 w-28 bg-slate-200 rounded-xl animate-pulse" />
      <div className="h-10 w-32 bg-slate-200 rounded-xl animate-pulse" />
    </div>
  </div>
);
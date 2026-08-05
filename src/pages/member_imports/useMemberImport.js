import { useState } from "react";

import { toast } from "sonner";

// import memberService from "@/services/memberService";
import {
  downloadMemberImportTemplate,
  importMembers,
} from "../../apis/backend_apis";

import { useProfile } from "../../contexts/ProfileContext";
import { downloadExcel } from "../../utils/downloadExcel";

export default function useMemberImport() {
  const [selectedFile, setSelectedFile] = useState(null);

  const [uploading, setUploading] = useState(false);

  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  const [downloadingErrors, setDownloadingErrors] = useState(false);

  const { profile } = useProfile();

  const [result, setResult] = useState(null);

  const [resultOpen, setResultOpen] = useState(false);

  //--------------------------------------------
  // Select File
  //--------------------------------------------

  const selectFile = (file) => {
    if (!file) return;

    setSelectedFile(file);
  };

  //--------------------------------------------
  // Remove File
  //--------------------------------------------

  const removeFile = () => {
    setSelectedFile(null);
  };

  //--------------------------------------------
  // Upload Excel
  //--------------------------------------------

  const uploadMembers = async () => {
    if (!selectedFile) {
      toast.error("Please choose an Excel file.");
      return;
    }

    try {
      setUploading(true);
      const response = await importMembers(selectedFile, profile?.ownerId);
      console.log(response);

      // This block only executes if the request returns a 2xx success status
      if (response.status === 200) {
        setResult(response.data);
        setResultOpen(true);
        toast.success("Import completed.");
      }
    } catch (error) {
      // 1. Extract the response status and data from the thrown Axios/API error
      const status = error.response?.status;
      const errorData = error.response?.data;

      // 2. Handle specific HTTP error status codes safely
      if (status === 404) {
        const msg = errorData?.message; // Optional chaining prevents crashes

        if (msg === "200" || msg === "150") {
          toast.error(
            `Your plan allows importing up to ${msg} members per file.`,
          );
        } else if (msg === "202") {
          toast.error("Uploaded file is not a valid Excel (.xlsx) file.");
        } else if (msg === "203") {
          toast.error("Please upload an Excel file.");
        } else if (msg === "204") {
          toast.error("Only Excel (.xlsx) files are supported.");
        } else if (msg === "empty") {
          toast.error("The uploaded Excel file contains no member data.");
        } else if (msg === "unable") {
          toast.error("Unable to read data in Excel file.");
        } else if (msg === "not save") {
          toast.error("Failed to save imported members.");
        }
        else if (msg === "missing") {
          toast.error("Some columns are missing from excel file");
        }
         else {
          toast.error(msg);
        }
      } else if (status === 429) {
        toast.error(
          "You are performing actions too quickly. Please wait a few seconds and try again.",
        );
      } else {
        // 3. Fallback for all other errors (500, network loss, etc.)
        toast.error("Import failed.");
      }
    } finally {
      setUploading(false);
    }
  };

  //--------------------------------------------
  // Download Template
  //--------------------------------------------

  const downloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);

      const response = await downloadMemberImportTemplate();

      if (response.status == 200) {
        downloadExcel(response.data, "member-import-template.xlsx");
      } else if (response.status === 429) {
        toast.error(
          "You are performing actions too quickly. Please wait a few seconds and try again.",
        );
      } else {
        toast.error("Unable to download template.");
      }
    } catch (err) {
      if (err.response?.status === 429) {
        toast.error(
          "You are performing actions too quickly. Please wait a few seconds and try again.",
        );
      } else {
        toast.error("Unable to download template.");
      }
    } finally {
      setDownloadingTemplate(false);
    }
  };

  //--------------------------------------------
  // Download Error Report
  //--------------------------------------------

  const downloadErrorReport = (response) => {
    const now = new Date();

    let report = "";

    report += "=====================================================\n";
    report += "          GYM MEMBER IMPORT ERROR REPORT\n";
    report += "=====================================================\n\n";

    report += `Generated On : ${now.toLocaleString()}\n\n`;

    report += "SUMMARY\n";
    report += "---------------------------------------------\n";
    report += `Total Records : ${response.totalRows}\n`;
    report += `Imported      : ${response.importedRows}\n`;
    report += `Failed        : ${response.failedRows}\n\n`;

    report += "=====================================================\n";
    report += "FAILED RECORDS\n";
    report += "=====================================================\n\n";

    response.errors.forEach((item) => {
      report += `Row Number : ${item.rowNumber}\n`;
      report += `Member     : ${item.memberName || "-"}\n`;
      report += "Errors:\n";

      item.errors.forEach((error) => {
        report += `  • ${error}\n`;
      });

      report += "\n---------------------------------------------\n\n";
    });

    report += "Please correct the above records and import again.";

    const blob = new Blob([report], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `Member_Import_Error_Report_${Date.now()}.txt`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const downloadErrors = async () => {
    try {
      setDownloadingErrors(true);

      // const response = await memberService.downloadImportErrors();

      const blob = new Blob(
        [response.data],

        {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      );

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = "Import_Errors.xlsx";

      link.click();

      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Unable to download errors.");
    } finally {
      setDownloadingErrors(false);
    }
  };

  //--------------------------------------------
  // Reset
  //--------------------------------------------

  const resetImport = () => {
    setSelectedFile(null);

    setResult(null);

    setResultOpen(false);
  };

  return {
    selectedFile,

    selectFile,

    removeFile,

    uploading,

    downloadTemplate,

    downloadingTemplate,

    downloadErrors,

    downloadingErrors,

    uploadMembers,

    result,

    resultOpen,

    setResultOpen,

    resetImport,
  };
}

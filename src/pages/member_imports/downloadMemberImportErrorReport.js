import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const downloadMemberImportErrorReport = async (response) => {
  try {
    const workbook = new ExcelJS.Workbook();

    workbook.creator = "Gym SaaS";
    workbook.company = "Gym SaaS";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Import Errors", {
      views: [
        {
          state: "frozen",
          ySplit: 8,
        },
      ],
    });

    // ===========================
    // COLORS
    // ===========================

    const COLORS = {
      BLUE: "1E40AF",
      LIGHT_BLUE: "DBEAFE",
      GREEN: "16A34A",
      LIGHT_GREEN: "DCFCE7",
      RED: "DC2626",
      LIGHT_RED: "FEE2E2",
      GRAY: "F3F4F6",
      BORDER: "D1D5DB",
      WHITE: "FFFFFF",
    };

    // ===========================
    // TITLE
    // ===========================

    sheet.mergeCells("A1:D1");

    const title = sheet.getCell("A1");

    title.value = "GYM MEMBER IMPORT ERROR REPORT";

    title.font = {
      bold: true,
      size: 18,
      color: {
        argb: COLORS.WHITE,
      },
    };

    title.alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    title.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: COLORS.BLUE,
      },
    };

    sheet.getRow(1).height = 28;

    // ===========================
    // SUMMARY
    // ===========================

    const summary = [
      {
        label: "Total Records",
        value: response.totalRows,
        color: COLORS.LIGHT_BLUE,
      },
      {
        label: "Successfully Imported",
        value: response.importedRows,
        color: COLORS.LIGHT_GREEN,
      },
      {
        label: "Failed Records",
        value: response.failedRows,
        color: COLORS.LIGHT_RED,
      },
      {
        label: "Generated On",
        value: new Date().toLocaleString(),
        color: COLORS.GRAY,
      },
    ];

    summary.forEach((item, index) => {
      const row = sheet.getRow(index + 3);

      // row.getCell(1).value = item[0];
      // row.getCell(2).value = item[1];

      row.getCell(1).value = item.label;
      row.getCell(2).value = item.value;

      row.getCell(1).font = {
        bold: true,
      };

      row.getCell(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: COLORS.LIGHT_BLUE,
        },
      };

      row.getCell(2).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb:
            item.label === "Failed Records"
              ? COLORS.LIGHT_RED
              : item.label === "Successfully Imported"
                ? COLORS.LIGHT_GREEN
                : COLORS.GRAY,
        },
      };

      row.eachCell((cell) => {
        cell.border = {
          top: {
            style: "thin",
          },
          left: {
            style: "thin",
          },
          right: {
            style: "thin",
          },
          bottom: {
            style: "thin",
          },
        };
      });
    });

    // ===========================
    // TABLE HEADER
    // ===========================

    // const headerRow = sheet.getRow(8);

    // headerRow.values = [
    //   "Excel Row",
    //   "Member Name",
    //   "Errors",
    // ];

    const headerRow = sheet.getRow(8);

    headerRow.getCell(1).value = "Excel Row";
    headerRow.getCell(2).value = "Member Name";
    headerRow.getCell(3).value = "Status";
    headerRow.getCell(4).value = "Errors";

    headerRow.height = 24;

    headerRow.eachCell((cell, index) => {
      const bg = index % 2 === 0 ? "FFFFFF" : "F8FAFC";
      cell.font = {
        bold: true,
        color: {
          argb: "000000",
        },
      };

      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: bg,
        },
      };

      cell.border = {
        top: {
          style: "thin",
        },
        left: {
          style: "thin",
        },
        right: {
          style: "thin",
        },
        bottom: {
          style: "thin",
        },
      };
    });

    // ===========================
    // ERROR DATA
    // ===========================

    response.errors.forEach((error, index) => {
      const row = sheet.addRow([
        error.rowNumber,
        error.memberName || "-",
        "FAILED",
        error.errors.join("\n"),
      ]);

      row.height = Math.max(25, error.errors.length * 18);

      row.eachCell((cell) => {
        cell.alignment = {
          vertical: "top",
          wrapText: true,
        };

        cell.border = {
          top: {
            style: "thin",
            color: {
              argb: COLORS.BORDER,
            },
          },
          left: {
            style: "thin",
            color: {
              argb: COLORS.BORDER,
            },
          },
          right: {
            style: "thin",
            color: {
              argb: COLORS.BORDER,
            },
          },
          bottom: {
            style: "thin",
            color: {
              argb: COLORS.BORDER,
            },
          },
        };
      });

      const statusCell = row.getCell(3);

      statusCell.font = {
        bold: true,
        color: {
          argb: COLORS.RED,
        },
      };

      statusCell.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      statusCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: COLORS.LIGHT_RED,
        },
      };

      const bg = index % 2 === 0 ? "FFFFFF" : "F8FAFC";
    });

    // ===========================
    // COLUMN WIDTHS
    // ===========================

    // sheet.getColumn(1).width = 20;
    // sheet.getColumn(2).width = 35;
    // sheet.getColumn(3).width = 90;
    sheet.getColumn(1).width = 18;
    sheet.getColumn(2).width = 35;
    sheet.getColumn(3).width = 15;
    sheet.getColumn(4).width = 90;

    // ===========================
    // AUTO FILTER
    // ===========================

    sheet.autoFilter = {
      from: "A8",
      to: "D8",
    };

    // ===========================
    // DOWNLOAD
    // ===========================

    const buffer = await workbook.xlsx.writeBuffer();

    // saveAs(new Blob([buffer]), `Member_Import_Error_Report_.xlsx`);
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `Member_Import_Error_Report.xlsx`);
  } catch (error) {
    console.error("Failed to generate error report:", error);
  }
};

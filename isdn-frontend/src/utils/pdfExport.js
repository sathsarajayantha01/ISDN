import jsPDF from "jspdf";
import "jspdf-autotable";

/**
 * Export data to PDF with a simple table format
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column definitions with key and header
 * @param {string} filename - Name of the PDF file
 * @param {string} title - Title of the report
 */
export const exportToPDF = (data, columns, filename, title) => {
  // Create new PDF document
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(16);
  doc.text(title, 14, 15);

  // Add date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

  // Prepare table headers
  const headers = columns.map((col) => col.header);

  // Prepare table data
  const tableData = data.map((row) => {
    return columns.map((col) => {
      let value = row[col.key];

      // Handle custom render function if exists
      if (col.render && typeof col.render === "function") {
        value = col.render(value, row);
      }

      // Handle special cases
      if (value === null || value === undefined) {
        return "-";
      }

      // If value is a React element or object, convert to string
      if (typeof value === "object") {
        // Handle nested objects (like category.name)
        if (col.key.includes(".")) {
          const keys = col.key.split(".");
          let nestedValue = row;
          for (const k of keys) {
            nestedValue = nestedValue?.[k];
          }
          return nestedValue || "-";
        }
        return JSON.stringify(value);
      }

      return String(value);
    });
  });

  // Add table
  doc.autoTable({
    startY: 28,
    head: [headers],
    body: tableData,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246], // Blue color
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  });

  // Save the PDF
  doc.save(`${filename}.pdf`);
};

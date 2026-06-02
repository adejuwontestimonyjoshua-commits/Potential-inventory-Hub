import { useInventory } from "@/context/InventoryContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export default function ReportsPage() {
  const { products, currentUser } = useInventory();
  const { toast } = useToast();

  const handleExportCSV = () => {
    try {
      const headers = ["ID", "Name", "Category", "Unit Price", "Quantity", "Min Threshold", "Storage Location", "Total Value", "Last Updated"];
      
      const rows = products.map(p => [
        p.id,
        `"${p.name}"`, // Quote names to handle commas
        p.category,
        p.unitPrice,
        p.quantity,
        p.minThreshold,
        `"${p.storageLocation}"`,
        (p.unitPrice * p.quantity).toFixed(2),
        p.lastUpdated
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(e => e.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `PIH_Inventory_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: "CSV report has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error generating the CSV file.",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      
      // === COVER / HEADER BAND ===
      doc.setFillColor(16, 20, 28);
      doc.rect(0, 0, pageW, 45, "F");
      
      doc.setFillColor(6, 182, 212);
      doc.rect(0, 0, pageW, 2, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("POTENTIAL INNOVATION HUB", 14, 16);
      
      doc.setTextColor(6, 182, 212);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("INVENTORY STATUS REPORT", 14, 24);
      
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      const generatedLine = `Generated: ${format(new Date(), "PPpp")}`;
      const byLine = `Prepared by: ${currentUser?.name || "System"} (${currentUser?.role || ""})`;
      doc.text(generatedLine, pageW - 14, 16, { align: "right" });
      doc.text(byLine, pageW - 14, 22, { align: "right" });

      const totalValue = products.reduce((s, p) => s + p.quantity * p.unitPrice, 0);
      const lowStockCount = products.filter(p => p.quantity < p.minThreshold).length;
      const totalUnits = products.reduce((s, p) => s + p.quantity, 0);
      
      const boxY = 53;
      const boxW = (pageW - 28 - 9) / 4;
      const summaryItems = [
        { label: "Total SKUs", value: products.length.toString() },
        { label: "Total Units", value: totalUnits.toLocaleString() },
        { label: "Inventory Value", value: `$${totalValue.toFixed(2)}` },
        { label: "Low Stock Items", value: lowStockCount.toString() },
      ];
      
      summaryItems.forEach((item, i) => {
        const x = 14 + i * (boxW + 3);
        doc.setFillColor(22, 27, 38);
        doc.roundedRect(x, boxY, boxW, 18, 1, 1, "F");
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text(item.label.toUpperCase(), x + 4, boxY + 6);
        doc.setTextColor(i === 3 && lowStockCount > 0 ? 239 : 226, i === 3 && lowStockCount > 0 ? 68 : 232, i === 3 && lowStockCount > 0 ? 68 : 240);
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text(item.value, x + 4, boxY + 14);
      });
      
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("COMPLETE INVENTORY LISTING", 14, 80);
      doc.setFillColor(30, 41, 59);
      doc.rect(14, 82, pageW - 28, 0.3, "F");

      const tableData = products.map(p => [
        p.id,
        p.name,
        p.category,
        `$${p.unitPrice.toFixed(2)}`,
        p.quantity.toString(),
        p.minThreshold.toString(),
        p.quantity < p.minThreshold ? "LOW" : "OK",
        p.storageLocation,
        `$${(p.quantity * p.unitPrice).toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: 84,
        head: [["ID", "Name", "Category", "Price", "Qty", "Min", "Status", "Location", "Value"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [16, 20, 28],
          textColor: [6, 182, 212],
          fontStyle: "bold",
          fontSize: 7,
          cellPadding: 3,
        },
        bodyStyles: {
          fontSize: 7,
          cellPadding: 2.5,
          textColor: [51, 65, 85],
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didParseCell: (data) => {
          if (data.section === "body") {
            const rawRow = data.row.raw as string[];
            const status = rawRow[6];
            if (status === "LOW") {
              if (data.column.index === 6) {
                data.cell.styles.textColor = [220, 38, 38];
                data.cell.styles.fontStyle = "bold";
              } else {
                data.cell.styles.textColor = [220, 38, 38];
              }
            }
          }
        },
        didDrawPage: (data) => {
          const pY = doc.internal.pageSize.getHeight() - 8;
          doc.setFontSize(7);
          doc.setTextColor(148, 163, 184);
          doc.setFont("helvetica", "normal");
          doc.text("CONFIDENTIAL — Potential Innovation Hub Internal Document", 14, pY);
          doc.text(`Page ${data.pageNumber}`, pageW - 14, pY, { align: "right" });
        },
      });

      doc.save(`PIH_Inventory_Report_${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast({ title: "Report Generated", description: "PDF inventory report downloaded." });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error generating the PDF file.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <PageHeader crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Reports" }]} />
        
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Exports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate printable reports and data exports for administrative review.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Data Export (CSV)
              </CardTitle>
              <CardDescription>
                Download the complete raw inventory data as a spreadsheet for external analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleExportCSV} className="w-full" data-testid="button-export-csv">
                <FileDown className="mr-2 h-4 w-4" />
                Generate CSV
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Printable Report (PDF)
              </CardTitle>
              <CardDescription>
                Generate a formatted, printable document suitable for management review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleExportPDF} variant="outline" className="w-full border-primary text-primary hover:bg-primary/10" data-testid="button-export-pdf">
                <FileDown className="mr-2 h-4 w-4" />
                Generate PDF
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
            <CardDescription>Sample of the data included in exports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Qty</th>
                    <th className="px-4 py-3 font-medium">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.slice(0, 5).map(p => (
                    <tr key={p.id} className="bg-card">
                      <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 font-mono">{p.quantity}</td>
                      <td className="px-4 py-3 font-mono">${(p.quantity * p.unitPrice).toFixed(2)}</td>
                    </tr>
                  ))}
                  {products.length > 5 && (
                    <tr className="bg-muted/10">
                      <td colSpan={4} className="px-4 py-3 text-center text-muted-foreground italic">
                        ... and {products.length - 5} more items
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

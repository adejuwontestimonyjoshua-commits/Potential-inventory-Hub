import { useInventory } from "@/context/InventoryContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export default function ReportsPage() {
  const { products } = useInventory();
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
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.text("Potential Innovation Hub", 14, 22);
      
      doc.setFontSize(14);
      doc.text("Inventory Status Report", 14, 32);
      
      doc.setFontSize(10);
      doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 14, 40);
      doc.text(`Total Items: ${products.length}`, 14, 46);
      
      const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);
      doc.text(`Total Value: $${totalValue.toFixed(2)}`, 14, 52);

      const tableData = products.map(p => [
        p.id,
        p.name,
        p.category,
        `$${p.unitPrice.toFixed(2)}`,
        p.quantity.toString(),
        p.quantity < p.minThreshold ? "LOW" : "OK",
        p.storageLocation
      ]);

      autoTable(doc, {
        startY: 60,
        head: [['ID', 'Name', 'Category', 'Price', 'Qty', 'Status', 'Location']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [0, 163, 255] }, // Match primary color roughly
        didParseCell: function(data) {
          // Highlight low stock rows
          if (data.row.section === 'body') {
            const qty = parseInt(data.row.raw[4]);
            const status = data.row.raw[5];
            if (status === "LOW") {
              data.cell.styles.textColor = [220, 38, 38]; // Red text for low stock
            }
          }
        }
      });

      doc.save(`PIH_Inventory_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      toast({
        title: "Export Successful",
        description: "PDF report has been downloaded.",
      });
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
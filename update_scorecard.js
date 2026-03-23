const fs = require('fs');
const file = 'src/views/Report/SupplyPlanScoreCard.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Add impots
content = content.replace(
  "import getLabelText from '../../CommonComponent/getLabelText';",
  `import getLabelText from '../../CommonComponent/getLabelText';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { makeText } from '../../CommonComponent/JavascriptCommonFunctions';
import { LOGO } from '../../CommonComponent/Logo.js';`
);

// 2. Add Export methods before render()
const methods = `
  /**
   * Exports the data to a CSV file.
   */
  exportCSV() {
    if (this.el) {
        this.el.download("SupplyPlanScoreCard.csv");
    }
  }

  /**
   * Exports the data to a PDF file.
   */
  exportPDF() {
    if (!this.el) return;
    const doc = new jsPDF('l', 'pt', 'a4', true);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.addImage(LOGO, 'png', 10, 10, 180, 50, 'FAST');
    doc.setTextColor("#002f6c");
    doc.text(i18n.t("static.dashboard.supplyplanscorecard"), doc.internal.pageSize.width / 2, 60, {
        align: 'center'
    });
    
    doc.autoTable({
        html: '#scorecardTableDiv table',
        startY: 80,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 }
    });
    
    doc.save("SupplyPlanScoreCard" + ".pdf");
  }

  render() {`;
content = content.replace("  render() {", methods);

// 3. Insert Icons inside render
const icons = `<div className="mb-3">
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                          <img style={{ height: '25px', width: '25px', cursor: 'pointer', marginRight: '10px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />
                          <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                        </div>`;
content = content.replace('<div className="mb-3">', icons);

fs.writeFileSync(file, content, 'utf8');

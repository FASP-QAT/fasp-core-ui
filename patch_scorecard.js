const fs = require('fs');

try {
  const filePath = 'src/views/Report/SupplyPlanScoreCard.js';
  let content = fs.readFileSync(filePath, 'utf8');

  // Insert Imports correctly at the top
  const importTarget = "import { hideFirstComponent, hideSecondComponent, roundARU, filterOptions, formatter } from '../../CommonComponent/JavascriptCommonFunctions';";
  const importReplacement = `import { hideFirstComponent, hideSecondComponent, roundARU, filterOptions, formatter, makeText } from '../../CommonComponent/JavascriptCommonFunctions';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { LOGO } from '../../CommonComponent/Logo.js';`;

  if(content.includes(importTarget)) {
     content = content.replace(importTarget, importReplacement);
  } else {
     console.log('Target for imports not found');
  }

  // Insert methods inside class
  const classTarget = "} from '../../Constants.js';"; // Find some unique identifier for imports... Wait, I'll use the constructor close
  const methodTarget = `    this.handleChange = this.handleChange.bind(this);
  }`;
  
  const methodReplacement = `    this.handleChange = this.handleChange.bind(this);
    this.exportCSV = this.exportCSV.bind(this);
    this.exportPDF = this.exportPDF.bind(this);
  }

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
    let y = 60;
    doc.text(i18n.t("static.dashboard.supplyplanscorecard"), doc.internal.pageSize.width / 2, y, {
        align: 'center'
    });
    
    doc.autoTable({
        html: '#scorecardTableDiv table',
        startY: 80,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 }
    });
    
    doc.save("SupplyPlanScoreCard.pdf");
  }`;

  if(content.includes(methodTarget)) {
    content = content.replace(methodTarget, methodReplacement);
  } else {
    console.log('Target for methods not found');
  }

  // Insert Icons
  const iconsTarget = '<div className="table-responsive">';
  const iconsReplacement = `<div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                          <img style={{ height: '25px', width: '25px', cursor: 'pointer', marginRight: '10px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />
                          <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                        </div>
                        <div className="table-responsive">`;

  if(content.includes(iconsTarget)) {
    content = content.replace(iconsTarget, iconsReplacement);
  } else {
    console.log('Target for icons not found');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Update Complete');
} catch (error) {
  console.error(error);
}

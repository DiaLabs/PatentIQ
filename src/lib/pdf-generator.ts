import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from "pdfmake/interfaces";

// Initialize pdfMake fonts
if (pdfFonts && (pdfFonts as any).pdfMake) {
  (pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;
} else if (pdfFonts) {
  (pdfMake as any).vfs = (pdfFonts as any).vfs;
}

export const generatePatentReport = (data: any) => {
  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    header: (currentPage) => {
      if (currentPage === 1) return null;
      return {
        text: 'Patent Scoring and Feedback Report',
        alignment: 'right',
        margin: [40, 20],
        fontSize: 9,
        color: '#999999'
      };
    },
    footer: (currentPage, pageCount) => {
      return {
        text: `Patent Scoring and Feedback Report | ${currentPage}`,
        alignment: 'right',
        margin: [40, 20],
        fontSize: 9,
        color: '#999999'
      };
    },
    content: [
      // Title Section
      {
        text: data.document_title || 'Patent Scoring and Improvement Report',
        style: 'mainTitle',
        alignment: 'center',
        margin: [0, 0, 0, 10]
      },
      {
        text: data.invention_title || 'Invention Title',
        style: 'inventionTitle',
        alignment: 'center',
        margin: [0, 0, 0, 40]
      },
      {
        text: 'Internal Patent-Screening Evaluation',
        alignment: 'center',
        fontSize: 12,
        color: '#555555',
        margin: [0, 0, 0, 40]
      },

      // Overview Table
      {
        table: {
          widths: [200, '*'],
          body: [
            [{ text: 'Review Parameter', style: 'tableHeader' }, { text: 'Finding', style: 'tableHeader' }],
            ['Overall Score', { text: `${data.document_metadata?.overall_score || data.overall_score || '0'} / 100`, bold: true }],
            ['Current Filing Status', data.document_metadata?.current_filing_status || data.verdict || 'Review Required'],
            ['Complete Filing Readiness', data.document_metadata?.complete_filing_readiness || 'N/A'],
            ['Patent Strength', data.document_metadata?.patent_strength || 'N/A'],
            ['Main Risk', data.document_metadata?.main_risk || 'N/A'],
            ['Best Improvement Direction', data.document_metadata?.best_improvement_direction || 'N/A'],
          ]
        },
        layout: 'lightHorizontalLines'
      },
      { text: '', margin: [0, 20] },
      {
        text: [
          { text: 'Source reviewed: ', bold: true },
          data.document_metadata?.source_reviewed || data.file_name || 'Uploaded document'
        ],
        fontSize: 10,
        margin: [0, 0, 0, 5]
      },
      {
        text: [
          { text: 'Important note: ', bold: true },
          data.document_metadata?.important_note || 'This report is an academic assessment.'
        ],
        fontSize: 10,
        color: '#666666',
        margin: [0, 0, 0, 20]
      },

      // Executive Verdict
      { text: '1. Executive Verdict', style: 'sectionHeader', pageBreak: 'before' },
      {
        text: data.executive_verdict?.summary || data.summary || 'N/A',
        lineHeight: 1.4
      },
      { text: '\n' },
      {
        text: data.executive_verdict?.current_issue || '',
        lineHeight: 1.4
      },
      { text: '\n' },
      {
        text: [
          { text: 'Recommended action: ', bold: true },
          data.executive_verdict?.recommended_action || 'N/A'
        ],
        lineHeight: 1.4
      },

      // Detailed Scoring
      { text: '2. Detailed Scoring', style: 'sectionHeader', margin: [0, 30, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: [150, 60, '*'],
          body: [
            [
              { text: 'Parameter', style: 'tableHeader' },
              { text: 'Score', style: 'tableHeader' },
              { text: 'Review Comment', style: 'tableHeader' }
            ],
            ...(data.detailed_scoring?.map((item: any) => [
              item.parameter,
              `${item.score} / 10`,
              item.review_comment
            ]) || [])
          ]
        },
        layout: 'lightHorizontalLines'
      },

      // Key Strengths
      { text: '3. Key Strengths', style: 'sectionHeader', margin: [0, 30, 0, 10] },
      {
        ul: data.key_strengths?.map((s: any) => ({
          text: [
            { text: s.title + ': ', bold: true },
            s.description
          ],
          margin: [0, 0, 0, 5]
        })) || []
      },

      // Weaknesses & Improvements
      { text: '4. Major Weaknesses and Improvements', style: 'sectionHeader', margin: [0, 30, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: [120, '*', '*'],
          body: [
            [
              { text: 'Weakness', style: 'tableHeader' },
              { text: 'Problem', style: 'tableHeader' },
              { text: 'Improvement Action', style: 'tableHeader' }
            ],
            ...(data.major_weaknesses_and_improvements?.map((item: any) => [
              item.weakness,
              item.problem,
              item.improvement_action
            ]) || [])
          ]
        },
        layout: 'lightHorizontalLines'
      },

      // Inventive Concept
      { text: '5. Improved Core Inventive Concept', style: 'sectionHeader', margin: [0, 30, 0, 10] },
      {
        text: data.improved_core_inventive_concept?.concept || 'N/A',
        italics: true,
        margin: [20, 0, 20, 10]
      },

      // Claim Structure
      { text: '6. Recommended Claim Structure', style: 'sectionHeader', margin: [0, 30, 0, 10] },
      {
        text: 'Independent System Claim Components:',
        bold: true,
        margin: [0, 0, 0, 5]
      },
      {
        ul: data.recommended_claim_structure?.independent_system_claim?.components || []
      },
      { text: '\n' },
      {
        text: 'Independent Method Claim Steps:',
        bold: true,
        margin: [0, 0, 0, 5]
      },
      {
        ol: data.recommended_claim_structure?.independent_method_claim?.steps || []
      }
    ],
    styles: {
      mainTitle: {
        fontSize: 24,
        bold: true,
        color: '#1a1a1a'
      },
      inventionTitle: {
        fontSize: 16,
        bold: true,
        color: '#444444'
      },
      sectionHeader: {
        fontSize: 18,
        bold: true,
        color: '#2c3e50',
        margin: [0, 20, 0, 10]
      },
      tableHeader: {
        bold: true,
        fontSize: 11,
        color: '#555555',
        fillColor: '#f8f9fa'
      }
    },
    defaultStyle: {
      fontSize: 11,
      color: '#333333'
    }
  };

  return pdfMake.createPdf(docDefinition);
};

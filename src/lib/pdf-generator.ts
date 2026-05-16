import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from "pdfmake/interfaces";

// Initialize pdfMake fonts
if (pdfFonts && (pdfFonts as any).pdfMake) {
  (pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;
} else if (pdfFonts) {
  (pdfMake as any).vfs = (pdfFonts as any).vfs;
}

export const generatePatentReport = (data: any, logoBase64?: string) => {
  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [40, 70, 40, 60],
    
    background: (currentPage, pageSize) => {
      if (logoBase64) {
        return {
          image: logoBase64,
          width: 300,
          opacity: 0.04, 
          absolutePosition: { x: (pageSize.width - 300) / 2, y: (pageSize.height - 300) / 2 }
        };
      }
      return {
        text: 'PATENTIQ EVALUATION',
        color: '#f0f0f0',
        opacity: 0.15,
        fontSize: 60,
        bold: true,
        alignment: 'center',
        margin: [0, pageSize.height / 2.5, 0, 0]
      };
    },

    header: (currentPage) => {
      return {
        columns: [
          {
            // Placeholder for logo as text/vector
            stack: [
              {
                text: 'PatentIQ Evaluation Report',
                fontSize: 11,
                bold: true,
                color: '#6366f1',
                margin: [40, 30, 0, 0]
              }
            ]
          }
        ]
      };
    },

    footer: (currentPage, pageCount) => {
      return {
        columns: [
          {
            text: `Evaluation Report | © ${new Date().getFullYear()} PatentIQ by DiaLabs`,
            fontSize: 8,
            color: '#9ca3af',
            margin: [40, 20, 0, 0]
          },
          {
            text: `Page ${currentPage} of ${pageCount}`,
            fontSize: 8,
            color: '#9ca3af',
            alignment: 'right',
            margin: [0, 20, 40, 0]
          }
        ]
      };
    },

    content: [
      // Page 1
      {
        text: 'PATENT SCORING AND IMPROVEMENT REPORT',
        style: 'reportLabel',
        margin: [0, 20, 0, 5]
      },
      {
        text: data.document_title || 'Patent Evaluation Report',
        style: 'mainTitle',
        margin: [0, 0, 0, 10]
      },
      {
        text: data.invention_title || 'Invention Disclosure',
        style: 'inventionTitle',
        margin: [0, 0, 0, 40]
      },

      {
        table: {
          widths: [200, '*'],
          body: [
            [{ text: 'Review Parameter', style: 'tableHeader' }, { text: 'Finding', style: 'tableHeader' }],
            ['Overall Score', { text: `${data.document_metadata?.overall_score || data.overall_score || '0'} / 100`, style: 'scoreValue' }],
            ['Current Filing Status', { text: data.document_metadata?.current_filing_status || data.verdict || 'Review Required', bold: true, fontSize: 10 }],
            ['Patent Strength', { text: data.document_metadata?.patent_strength || 'N/A', color: '#10b981', bold: true, fontSize: 10 }],
            ['Main Risk Factor', { text: data.document_metadata?.main_risk || 'N/A', italics: true, color: '#4b5563', fontSize: 10 }],
          ]
        },
        layout: {
          hLineWidth: (i: number) => (i === 0 || i === 5) ? 0 : 0.5,
          vLineWidth: () => 0,
          hLineColor: () => '#f3f4f6',
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 12,
          paddingBottom: () => 12,
        }
      },

      { text: '\n\n' },
      
      { text: '1. EXECUTIVE VERDICT', style: 'sectionHeader' },
      {
        text: data.executive_verdict?.summary || data.summary || 'N/A',
        style: 'paragraph'
      },
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                stack: [
                  { text: 'RECOMMENDED ACTION', fontSize: 8, bold: true, color: '#92400e', margin: [0, 0, 0, 4] },
                  { text: data.executive_verdict?.recommended_action || 'N/A', fontSize: 10, color: '#1f2937', italics: true }
                ],
                fillColor: '#fffbeb',
                margin: [15, 12, 15, 12]
              }
            ]
          ]
        },
        layout: 'noBorders',
        margin: [0, 20, 0, 0]
      },

      // Page 2
      { text: '2. DETAILED SCORING', style: 'sectionHeader', pageBreak: 'before' },
      data.detailed_scoring && data.detailed_scoring.length > 0 ? {
        table: {
          headerRows: 1,
          widths: [150, 60, '*'],
          body: [
            [
              { text: 'Parameter', style: 'tableHeader' },
              { text: 'Score', style: 'tableHeader' },
              { text: 'Review Comment', style: 'tableHeader' }
            ],
            ...data.detailed_scoring.map((item: any) => [
              { text: item.parameter, bold: true, fontSize: 10, color: '#111827' },
              { text: `${item.score} / 100`, color: '#6366f1', bold: true, fontSize: 10 },
              { text: item.review_comment, fontSize: 9, color: '#6b7280', lineHeight: 1.3 }
            ])
          ]
        },
        layout: {
          hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 0 : 0.5,
          vLineWidth: () => 0,
          hLineColor: () => '#f3f4f6',
          paddingLeft: () => 0,
          paddingRight: () => 8,
          paddingTop: () => 12,
          paddingBottom: () => 12,
        }
      } : { text: 'Detailed scoring data unavailable.', style: 'paragraph', italics: true },

      { text: '3. KEY STRENGTHS', style: 'sectionHeader', margin: [0, 40, 0, 15] },
      data.key_strengths && data.key_strengths.length > 0 ? {
        columns: data.key_strengths.map((s: any, i: number) => ({
          width: '50%',
          stack: [
            { text: s.title, bold: true, color: '#059669', fontSize: 11, margin: [0, 0, 0, 6] },
            { text: s.description, fontSize: 9, color: '#4b5563', lineHeight: 1.4 }
          ],
          margin: [i % 2 === 0 ? 0 : 10, 0, i % 2 === 0 ? 10 : 0, 20]
        }))
      } : { text: 'Key strengths data unavailable.', style: 'paragraph', italics: true },

      // Page 3
      { text: '4. REFERENCE PATENTS', style: 'sectionHeader', pageBreak: 'before' },
      (data.stage_1?.patent_ids || data.patent_identifiers || []).length > 0 ? {
        table: {
          widths: ['*'],
          body: (data.stage_1?.patent_ids || data.patent_identifiers || []).map((id: string) => [
            {
              columns: [
                { text: id, bold: true, fontSize: 11, color: '#111827', width: 100 },
                { text: 'Potential prior art identified for functional overlap analysis.', fontSize: 9, color: '#6b7280' }
              ],
              margin: [0, 10, 0, 10]
            }
          ])
        },
        layout: 'lightHorizontalLines'
      } : { text: 'No reference patents identified.', style: 'paragraph', italics: true },

      { text: '5. MAJOR WEAKNESSES AND IMPROVEMENTS', style: 'sectionHeader', margin: [0, 40, 0, 15] },
      data.major_weaknesses_and_improvements && data.major_weaknesses_and_improvements.length > 0 ? {
        table: {
          headerRows: 1,
          widths: [120, '*', '*'],
          body: [
            [
              { text: 'Weakness', style: 'tableHeader' },
              { text: 'Problem Area', style: 'tableHeader' },
              { text: 'Recommended Improvement', style: 'tableHeader' }
            ],
            ...data.major_weaknesses_and_improvements.map((item: any) => [
              { text: item.weakness, bold: true, fontSize: 10, color: '#111827' },
              { text: item.problem, fontSize: 9, color: '#6b7280', lineHeight: 1.3 },
              { text: item.improvement_action, fontSize: 9, color: '#6366f1', bold: true, lineHeight: 1.3 }
            ])
          ]
        },
        layout: {
          hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 0 : 0.5,
          vLineWidth: () => 0,
          hLineColor: () => '#f3f4f6',
          paddingLeft: () => 0,
          paddingRight: () => 8,
          paddingTop: () => 12,
          paddingBottom: () => 12,
        }
      } : { text: 'No major weaknesses identified.', style: 'paragraph', italics: true },

      // Page 4
      { text: '6. IMPROVED CORE INVENTIVE CONCEPT', style: 'sectionHeader', pageBreak: 'before' },
      {
        table: {
          widths: ['*'],
          body: [[
            {
              text: data.improved_core_inventive_concept?.concept || 'Improved inventive concept analysis pending.',
              fontSize: 11,
              lineHeight: 1.6,
              margin: [30, 25, 30, 25],
              alignment: 'center',
              color: '#374151',
              fillColor: '#f9fafb',
              italics: true
            }
          ]]
        },
        layout: 'noBorders'
      },

      { text: '7. RECOMMENDED CLAIM STRUCTURE', style: 'sectionHeader', margin: [0, 40, 0, 15] },
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'SYSTEM COMPONENTS', fontSize: 8, bold: true, color: '#9ca3af', margin: [0, 0, 0, 12], characterSpacing: 1 },
              {
                ul: data.recommended_claim_structure?.independent_system_claim?.components && data.recommended_claim_structure.independent_system_claim.components.length > 0 
                    ? data.recommended_claim_structure.independent_system_claim.components 
                    : ['Component analysis pending.'],
                fontSize: 10.5,
                color: '#4b5563',
                lineHeight: 1.4
              }
            ],
            margin: [0, 0, 20, 0]
          },
          {
            width: '50%',
            stack: [
              { text: 'METHOD STEPS', fontSize: 8, bold: true, color: '#9ca3af', margin: [0, 0, 0, 12], characterSpacing: 1 },
              {
                ol: data.recommended_claim_structure?.independent_method_claim?.steps && data.recommended_claim_structure.independent_method_claim.steps.length > 0
                    ? data.recommended_claim_structure.independent_method_claim.steps 
                    : ['Method step analysis pending.'],
                fontSize: 10.5,
                color: '#4b5563',
                lineHeight: 1.4
              }
            ]
          }
        ]
      },

      {
        text: 'DISCLAIMER: ' + (data.document_metadata?.important_note || 'This report is an automated academic evaluation report and should be used for informational purposes only.'),
        fontSize: 7.5,
        color: '#9ca3af',
        alignment: 'center',
        margin: [40, 60, 40, 0],
        italics: true,
        lineHeight: 1.4
      }
    ],
    styles: {
      reportLabel: {
        fontSize: 9,
        bold: true,
        color: '#6366f1',
        characterSpacing: 2
      },
      mainTitle: {
        fontSize: 24,
        bold: true,
        color: '#111827',
        lineHeight: 1.2
      },
      inventionTitle: {
        fontSize: 14,
        bold: true,
        color: '#6b7280',
        lineHeight: 1.4
      },
      sectionHeader: {
        fontSize: 14,
        bold: true,
        color: '#111827',
        margin: [0, 20, 0, 15],
        characterSpacing: 0.5
      },
      tableHeader: {
        bold: true,
        fontSize: 10,
        color: '#9ca3af',
        fillColor: '#fcfcfc',
        margin: [0, 5, 0, 5],
        characterSpacing: 1
      },
      paragraph: {
        fontSize: 10.5,
        color: '#374151',
        lineHeight: 1.6
      },
      scoreValue: {
        fontSize: 16,
        bold: true,
        color: '#6366f1'
      }
    },
    defaultStyle: {
      font: 'Roboto'
    }
  };

  return pdfMake.createPdf(docDefinition);
};

const fs = require('fs');
const files = [
  'src/components/InvoicePDFMidnight.tsx',
  'src/components/InvoicePDFOcean.tsx',
  'src/components/InvoicePDFRose.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Add bankDetails to Invoice interface
  content = content.replace(
    /currency\?\: \{ symbol\: string; code\: string \}\n\}/,
    'currency?: { symbol: string; code: string }\n  bankDetails?: string | null\n}'
  );
  
  // Replace notes block
  content = content.replace(
    /\{invoice\.notes && \(\n\s*<View style=\{styles\.notesBox\}>\n\s*<Text style=\{styles\.notesLabel\}>Notes & Payment Terms<\/Text>\n\s*<Text style=\{styles\.notesText\}>\{invoice\.notes\}<\/Text>\n\s*<\/View>\n\s*\)\}/,
    `{(invoice.notes || invoice.bankDetails) && (
          <View style={styles.notesBox}>
            {invoice.notes && (
              <>
                <Text style={styles.notesLabel}>Notes & Payment Terms</Text>
                <Text style={styles.notesText}>{invoice.notes}</Text>
              </>
            )}
            {invoice.bankDetails && (
              <View style={{ marginTop: invoice.notes ? 10 : 0 }}>
                <Text style={styles.notesLabel}>Bank Details</Text>
                <Text style={styles.notesText}>{invoice.bankDetails}</Text>
              </View>
            )}
          </View>
        )}`
  );

  fs.writeFileSync(file, content);
}
console.log("Done");

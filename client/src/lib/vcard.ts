export interface VCardData {
  name: string;
  title?: string;
  company?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  facebook?: string;
  x?: string;
  instagram?: string;
  linkedin?: string;
  tiktok?: string;
  photoUrl?: string;
}

export function generateVCard(data: VCardData): string {
  const nameParts = data.name.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCardValue(data.name)}`,
    `N:${escapeVCardValue(lastName)};${escapeVCardValue(firstName)};;;`,
  ];

  if (data.title) {
    lines.push(`TITLE:${escapeVCardValue(data.title)}`);
  }

  if (data.company) {
    lines.push(`ORG:${escapeVCardValue(data.company)}`);
  }

  if (data.phone) {
    lines.push(`TEL;TYPE=CELL:${escapeVCardValue(data.phone)}`);
  }

  if (data.whatsapp && data.whatsapp !== data.phone) {
    lines.push(`TEL;TYPE=CELL;X-WHATSAPP:${escapeVCardValue(data.whatsapp)}`);
  }

  if (data.email) {
    lines.push(`EMAIL:${escapeVCardValue(data.email)}`);
  }

  if (data.website) {
    lines.push(`URL:${escapeVCardValue(data.website)}`);
  }

  const notes: string[] = [];
  if (data.facebook) {
    notes.push(`Facebook: ${data.facebook}`);
  }
  if (data.x) {
    notes.push(`X: ${data.x}`);
  }
  if (data.instagram) {
    notes.push(`Instagram: ${data.instagram}`);
  }
  if (data.linkedin) {
    notes.push(`LinkedIn: ${data.linkedin}`);
  }
  if (data.tiktok) {
    notes.push(`TikTok: ${data.tiktok}`);
  }

  if (notes.length > 0) {
    lines.push(`NOTE:${escapeVCardValue(notes.join('\\n'))}`);
  }

  lines.push('END:VCARD');
  
  return lines.join('\r\n');
}

function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function downloadVCard(data: VCardData): void {
  const vcfContent = generateVCard(data);
  const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.name.replace(/\s+/g, '_')}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

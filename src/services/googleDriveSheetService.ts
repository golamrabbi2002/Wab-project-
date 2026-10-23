import { Product, Order, StoreConfig } from '../types';

/**
 * Service to sync products, orders, and assets with Google Sheets and Google Drive.
 * Supports CSV export, Direct Webhook/AppScript Sync, and Drive Asset linking.
 */
export class GoogleDriveSheetService {
  /**
   * Export Products to Google Sheet-compatible CSV format
   */
  static exportProductsToCSV(products: Product[]): void {
    const headers = [
      'Product ID',
      'Title',
      'Subtitle',
      'Category',
      'Price',
      'Original Price',
      'Stock',
      'SKU',
      'Sizes',
      'Material',
      'Image URL / Drive Link',
      'Created At'
    ];

    const rows = products.map((p) => [
      p.id,
      `"${(p.title || '').replace(/"/g, '""')}"`,
      `"${(p.subtitle || '').replace(/"/g, '""')}"`,
      p.category,
      p.price,
      p.originalPrice || '',
      p.stock,
      p.sku,
      `"${(p.sizes || []).join(', ')}"`,
      `"${(p.material || '').replace(/"/g, '""')}"`,
      p.image?.startsWith('data:') ? '[Base64/Local Image]' : p.image,
      p.createdAt
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    this.downloadFile(csvContent, `Aura_Atelier_Products_GoogleSheet_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  }

  /**
   * Export Orders to Google Sheet-compatible CSV format
   */
  static exportOrdersToCSV(orders: Order[]): void {
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Address',
      'Items Count',
      'Total Amount',
      'Payment Method',
      'Status'
    ];

    const rows = orders.map((o) => [
      o.orderNumber,
      o.createdAt,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      o.customerEmail,
      o.customerPhone || '',
      `"${(o.shippingAddress?.street || '')}, ${(o.shippingAddress?.city || '')}"`,
      (o.items || []).reduce((acc, curr) => acc + curr.quantity, 0),
      o.total,
      o.paymentMethod,
      o.status
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    this.downloadFile(csvContent, `Aura_Atelier_Orders_GoogleSheet_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  }

  /**
   * Helper to trigger instant download of generated files
   */
  private static downloadFile(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type: `${type};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Extract unique File ID from any Google Drive link format:
   * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
   * - https://drive.google.com/open?id=FILE_ID
   * - https://drive.google.com/uc?id=FILE_ID
   * - https://docs.google.com/uc?id=FILE_ID
   * - https://lh3.googleusercontent.com/d/FILE_ID
   */
  static extractGoogleDriveFileId(url: string): string | null {
    if (!url) return null;
    const trimmed = url.trim();

    // Pattern 1: /file/d/{id}
    const matchFileD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (matchFileD && matchFileD[1]) return matchFileD[1];

    // Pattern 2: ?id={id} or &id={id}
    const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (matchIdParam && matchIdParam[1]) return matchIdParam[1];

    // Pattern 3: lh3.googleusercontent.com/d/{id}
    const matchLh3 = trimmed.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
    if (matchLh3 && matchLh3[1]) return matchLh3[1];

    // Pattern 4: /thumbnail?id={id}
    const matchThumb = trimmed.match(/\/thumbnail\?id=([a-zA-Z0-9_-]+)/);
    if (matchThumb && matchThumb[1]) return matchThumb[1];

    // Pattern 5: Direct raw File ID (25 to 50 alphanumeric characters)
    if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
      return trimmed;
    }

    return null;
  }

  /**
   * Convert Google Drive shareable link to modern unblocked direct Google CDN URL.
   * Avoids deprecated uc?export=view (which returns 403 Forbidden on web embeds)
   * and provides instant, high-speed public display.
   */
  static formatGoogleDriveImageUrl(url: string): string {
    if (!url) return url;
    const trimmed = url.trim();

    // If already direct lh3 Google CDN link, return as-is
    if (trimmed.startsWith('https://lh3.googleusercontent.com/d/')) {
      return trimmed;
    }

    const fileId = this.extractGoogleDriveFileId(trimmed);
    if (fileId) {
      // Unblocked direct Google CDN endpoint for public images
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }

    return trimmed;
  }

  /**
   * High-definition thumbnail endpoint alternative (up to 1600px width)
   */
  static getGoogleDriveThumbnailUrl(url: string, size = 1600): string {
    const fileId = this.extractGoogleDriveFileId(url);
    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
    }
    return url;
  }
}

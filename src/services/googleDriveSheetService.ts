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
   * Convert Google Drive shareable link to direct embedding image link
   * Converts: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
   * Into: https://drive.google.com/uc?export=view&id=FILE_ID
   */
  static formatGoogleDriveImageUrl(url: string): string {
    if (!url) return url;
    if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
    }
    return url;
  }
}

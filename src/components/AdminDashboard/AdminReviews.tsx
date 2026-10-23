import React, { useState, useEffect } from 'react';
import { Review, Product } from '../../types';
import { FirestoreSyncService } from '../../services/firestoreService';
import { 
  Star, MessageSquare, Trash2, CheckCircle2, Search, Filter, 
  ExternalLink, UserCheck, ShieldCheck, RefreshCw, AlertCircle
} from 'lucide-react';

interface AdminReviewsProps {
  products: Product[];
  showToast: (msg: string, type?: 'success' | 'info') => void;
}

export const AdminReviews: React.FC<AdminReviewsProps> = ({ products, showToast }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Subscribe to real-time reviews from Cloud Firestore
  useEffect(() => {
    setLoading(true);
    const unsub = FirestoreSyncService.subscribeAllReviews((allReviews) => {
      setReviews(allReviews);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this customer review?')) return;
    setDeletingId(reviewId);
    try {
      await FirestoreSyncService.deleteReview(reviewId);
      showToast('✓ Review permanently removed from Cloud Firestore.', 'success');
    } catch (err: any) {
      console.warn('Error deleting review:', err);
      showToast('Failed to delete review.', 'info');
    } finally {
      setDeletingId(null);
    }
  };

  // Map product id to title
  const productMap = new Map<string, Product>(products.map((p) => [p.id, p]));

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch = 
      (r.author || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.comment || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (productMap.get(r.productId)?.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = selectedRating === 'all' || r.rating === selectedRating;
    return matchesSearch && matchesRating;
  });

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-6">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Total Reviews</span>
            <div className="text-2xl font-bold font-serif text-white mt-1">{reviews.length}</div>
            <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">⚡ Live Cloud Synced</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Average Rating</span>
            <div className="text-2xl font-bold font-serif text-white mt-1 flex items-center gap-1.5">
              <span>{averageRating}</span>
              <div className="flex text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono mt-0.5 block">Across all products</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Verified Buyers</span>
            <div className="text-2xl font-bold font-serif text-white mt-1">
              {reviews.filter((r) => r.verifiedPurchase).length}
            </div>
            <span className="text-[10px] text-amber-400 font-mono mt-0.5 block">100% Genuine reviews</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-400/10 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, review or garment..."
            className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-750 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400/60"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-neutral-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Rating:
          </span>
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-1.5 bg-neutral-900 border border-neutral-750 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60"
          >
            <option value="all">All Stars (1 - 5 ★)</option>
            <option value="5">5 Stars only</option>
            <option value="4">4 Stars only</option>
            <option value="3">3 Stars only</option>
            <option value="2">2 Stars only</option>
            <option value="1">1 Star only</option>
          </select>
        </div>
      </div>

      {/* Reviews Table / List */}
      <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
            <p className="text-xs font-mono">Syncing real-time customer reviews from Firebase Firestore...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-neutral-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-3 text-neutral-600" />
            <h4 className="text-sm font-semibold text-neutral-300">No customer reviews yet</h4>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Any reviews posted on the public garment pages will instantly sync and appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-850">
            {filteredReviews.map((rev) => {
              const prod = productMap.get(rev.productId);
              return (
                <div key={rev.id} className="p-4 sm:p-5 hover:bg-neutral-900/40 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-sm">{rev.author}</span>
                      {rev.verifiedPurchase && (
                        <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 rounded text-[10px] font-bold">
                          ✓ Verified Buyer
                        </span>
                      )}
                      <span className="text-[11px] text-neutral-500 font-mono">{rev.date}</span>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-neutral-700'}`}
                        />
                      ))}
                      <span className="text-xs font-bold font-mono text-neutral-300 ml-1">
                        {rev.rating}.0
                      </span>
                    </div>

                    {/* Comment text */}
                    <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/80">
                      "{rev.comment}"
                    </p>

                    {/* Associated Garment */}
                    {prod ? (
                      <div className="flex items-center gap-2 text-xs text-neutral-400 pt-1">
                        <span className="text-neutral-500">Garment:</span>
                        <span className="text-amber-300 font-medium">{prod.title}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">({prod.category} • SKU: {prod.sku})</span>
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-500">
                        Product ID: <span className="font-mono">{rev.productId}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
                    <button
                      onClick={() => handleDelete(rev.id)}
                      disabled={deletingId === rev.id}
                      className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      title="Delete review from Cloud Firestore"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{deletingId === rev.id ? 'Deleting...' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

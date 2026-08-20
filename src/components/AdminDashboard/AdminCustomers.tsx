import React, { useState } from 'react';
import { Customer, Order, StoreConfig, Product } from '../../types';
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  Heart,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  Download,
  CheckCircle2,
  X,
  UserCheck,
} from 'lucide-react';

interface AdminCustomersProps {
  customers: Customer[];
  orders: Order[];
  products: Product[];
  config: StoreConfig;
  onSaveCustomer: (customer: Customer) => void;
  onDeleteCustomer?: (id: string) => void;
}

export const AdminCustomers: React.FC<AdminCustomersProps> = ({
  customers,
  orders,
  products,
  config,
  onSaveCustomer,
  onDeleteCustomer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form fields for edit/add
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStreet, setEditStreet] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editZip, setEditZip] = useState('');
  const [editCountry, setEditCountry] = useState('');

  // Search filter
  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.shippingAddress?.city && c.shippingAddress.city.toLowerCase().includes(q))
    );
  });

  // Helper stats
  const totalCustomers = customers.length;
  const customersWithOrders = customers.filter((c) =>
    orders.some((o) => o.customerId === c.id || o.customerEmail.toLowerCase() === c.email.toLowerCase())
  ).length;

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  // Open Customer Detail Modal
  const handleViewCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    setIsEditing(false);
  };

  // Open Edit Form
  const handleStartEdit = (c: Customer) => {
    setSelectedCustomer(c);
    setEditName(c.name);
    setEditEmail(c.email);
    setEditPhone(c.phone || '');
    setEditStreet(c.shippingAddress?.street || '');
    setEditCity(c.shippingAddress?.city || '');
    setEditState(c.shippingAddress?.state || '');
    setEditZip(c.shippingAddress?.zip || '');
    setEditCountry(c.shippingAddress?.country || 'Bangladesh');
    setIsEditing(true);
    setIsAddingNew(false);
  };

  // Open Add New Form
  const handleStartAdd = () => {
    setEditName('');
    setEditEmail('');
    setEditPhone('');
    setEditStreet('');
    setEditCity('Dhaka');
    setEditState('Dhaka Division');
    setEditZip('1212');
    setEditCountry('Bangladesh');
    setSelectedCustomer(null);
    setIsAddingNew(true);
    setIsEditing(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Customer = {
      id: isAddingNew ? `cust-${Date.now()}` : selectedCustomer!.id,
      name: editName.trim(),
      email: editEmail.toLowerCase().trim(),
      phone: editPhone.trim(),
      avatar: selectedCustomer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      shippingAddress: {
        street: editStreet.trim(),
        city: editCity.trim(),
        state: editState.trim(),
        zip: editZip.trim(),
        country: editCountry.trim(),
      },
      wishlist: selectedCustomer?.wishlist || [],
      createdAt: selectedCustomer?.createdAt || new Date().toISOString(),
    };

    onSaveCustomer(updated);
    setSelectedCustomer(updated);
    setIsEditing(false);
    setIsAddingNew(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'City', 'Country', 'Total Orders', 'Total Spend', 'Joined Date'];
    const rows = customers.map((c) => {
      const custOrders = orders.filter(
        (o) => o.customerId === c.id || o.customerEmail.toLowerCase() === c.email.toLowerCase()
      );
      const spend = custOrders.reduce((sum, o) => sum + o.total, 0);
      return [
        c.id,
        `"${c.name}"`,
        c.email,
        c.phone || '',
        `"${c.shippingAddress?.city || ''}"`,
        `"${c.shippingAddress?.country || ''}"`,
        custOrders.length,
        spend.toFixed(2),
        new Date(c.createdAt).toLocaleDateString(),
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fadeIn text-xs">
      
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Registered Clients</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{totalCustomers}</div>
          <span className="text-[10px] text-neutral-500 font-mono">Members in Local Storage DB</span>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Active Buyers</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{customersWithOrders}</div>
          <span className="text-[10px] text-neutral-500 font-mono">Placed 1 or more atelier orders</span>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Avg. Order Value</span>
            <ShoppingBag className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400">
            {config.currencySymbol}{avgOrderValue.toFixed(2)}
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">Per customer transaction</span>
        </div>
      </div>

      {/* Control Bar: Search & Action Buttons */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, email, phone, city..."
            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 text-xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors active:scale-98"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleStartAdd}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/50 text-[10px] uppercase tracking-wider text-neutral-400 font-mono">
                <th className="py-3.5 px-4 font-semibold">Customer / Member</th>
                <th className="py-3.5 px-4 font-semibold">Contact & Phone</th>
                <th className="py-3.5 px-4 font-semibold">Delivery City / Location</th>
                <th className="py-3.5 px-4 font-semibold">Orders & Spend</th>
                <th className="py-3.5 px-4 font-semibold">Joined Date</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500 font-light">
                    No customers found matching "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const custOrders = orders.filter(
                    (o) => o.customerId === customer.id || o.customerEmail.toLowerCase() === customer.email.toLowerCase()
                  );
                  const totalSpent = custOrders.reduce((sum, o) => sum + o.total, 0);

                  return (
                    <tr key={customer.id} className="hover:bg-neutral-900/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={customer.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                            alt={customer.name}
                            className="w-9 h-9 rounded-full object-cover border border-neutral-700 bg-neutral-800"
                          />
                          <div>
                            <div className="font-bold text-white text-xs">{customer.name}</div>
                            <div className="text-[10px] text-neutral-400 font-mono">{customer.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-neutral-300">
                        {customer.phone ? (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>{customer.phone}</span>
                          </div>
                        ) : (
                          <span className="text-neutral-600 italic">No phone added</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-neutral-300">
                        {customer.shippingAddress?.city ? (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
                            <span>{customer.shippingAddress.city}, {customer.shippingAddress.country}</span>
                          </div>
                        ) : (
                          <span className="text-neutral-600 italic">Not set</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className="text-amber-300 font-bold">
                          {config.currencySymbol}{totalSpent.toFixed(2)}
                        </span>
                        <div className="text-[10px] text-neutral-500">
                          {custOrders.length} {custOrders.length === 1 ? 'order' : 'orders'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px]">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewCustomer(customer)}
                            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg border border-neutral-700 transition-colors"
                            title="View Customer Profile"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                          </button>
                          <button
                            onClick={() => handleStartEdit(customer)}
                            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg border border-neutral-700 transition-colors"
                            title="Edit Customer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-neutral-300" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOMER DETAIL / EDIT MODAL */}
      {(selectedCustomer || isAddingNew) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-neutral-900 border border-neutral-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-neutral-100">
            
            {/* Header */}
            <div className="p-6 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-400/10 text-amber-400 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {isAddingNew
                      ? 'Add New Customer Profile'
                      : isEditing
                      ? `Edit Client: ${selectedCustomer?.name}`
                      : `Client Dossier: ${selectedCustomer?.name}`}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    {isAddingNew
                      ? 'Manually register a customer record into local database.'
                      : `Member ID: ${selectedCustomer?.id}`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setIsEditing(false);
                  setIsAddingNew(false);
                }}
                className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body: Either Form OR Dossier View */}
            <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto space-y-6">
              
              {isEditing ? (
                /* EDIT/ADD FORM */
                <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-neutral-300 font-semibold uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                        placeholder="e.g. Tanzim Ahmed"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-300 font-semibold uppercase tracking-wider mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                        placeholder="tanzim@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-300 font-semibold uppercase tracking-wider mb-1">
                        Phone Number (Mobile / SMS)
                      </label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                        placeholder="+880 1712-345678"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-300 font-semibold uppercase tracking-wider mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={editCountry}
                        onChange={(e) => setEditCountry(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                        placeholder="Bangladesh"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-3 pt-2 border-t border-neutral-800">
                    <label className="block text-neutral-300 font-semibold uppercase tracking-wider">
                      Shipping / Delivery Address
                    </label>
                    <input
                      type="text"
                      value={editStreet}
                      onChange={(e) => setEditStreet(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                      placeholder="House 42, Road 11, Banani"
                    />

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <input
                          type="text"
                          value={editCity}
                          onChange={(e) => setEditCity(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                          placeholder="Dhaka"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={editState}
                          onChange={(e) => setEditState(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                          placeholder="Dhaka Division"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={editZip}
                          onChange={(e) => setEditZip(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                          placeholder="1213"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        if (isAddingNew) setSelectedCustomer(null);
                      }}
                      className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 rounded-xl font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold uppercase tracking-wider rounded-xl shadow-lg"
                    >
                      Save Customer Record
                    </button>
                  </div>
                </form>
              ) : (
                /* DOSSIER & ORDER HISTORY VIEW */
                selectedCustomer && (
                  <div className="space-y-6">
                    {/* Profile Header Card */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 bg-neutral-950 rounded-2xl border border-neutral-800">
                      <img
                        src={selectedCustomer.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                        alt={selectedCustomer.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-md"
                      />
                      <div className="space-y-1 text-center sm:text-left flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h4 className="text-base font-bold text-white">{selectedCustomer.name}</h4>
                          <button
                            onClick={() => handleStartEdit(selectedCustomer)}
                            className="text-xs text-amber-400 hover:underline flex items-center justify-center sm:justify-start gap-1 font-semibold"
                          >
                            <Edit2 className="w-3 h-3" /> Edit Profile
                          </button>
                        </div>
                        <div className="text-neutral-400 font-mono text-[11px] flex items-center justify-center sm:justify-start gap-2">
                          <Mail className="w-3.5 h-3.5 text-neutral-500" />
                          <a href={`mailto:${selectedCustomer.email}`} className="hover:text-amber-300">
                            {selectedCustomer.email}
                          </a>
                        </div>
                        {selectedCustomer.phone && (
                          <div className="text-neutral-400 font-mono text-[11px] flex items-center justify-center sm:justify-start gap-2">
                            <Phone className="w-3.5 h-3.5 text-neutral-500" />
                            <a href={`tel:${selectedCustomer.phone}`} className="hover:text-amber-300">
                              {selectedCustomer.phone}
                            </a>
                          </div>
                        )}
                        <div className="text-neutral-400 text-[11px] flex items-center justify-center sm:justify-start gap-2 pt-1">
                          <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                          <span>
                            {selectedCustomer.shippingAddress?.street}, {selectedCustomer.shippingAddress?.city},{' '}
                            {selectedCustomer.shippingAddress?.country}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order History for this customer */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold uppercase tracking-wider text-neutral-300 text-[11px]">
                          Fulfillment Order History
                        </h5>
                        <span className="text-neutral-500 font-mono text-[10px]">
                          {
                            orders.filter(
                              (o) =>
                                o.customerId === selectedCustomer.id ||
                                o.customerEmail.toLowerCase() === selectedCustomer.email.toLowerCase()
                            ).length
                          }{' '}
                          recorded orders
                        </span>
                      </div>

                      <div className="space-y-2">
                        {orders
                          .filter(
                            (o) =>
                              o.customerId === selectedCustomer.id ||
                              o.customerEmail.toLowerCase() === selectedCustomer.email.toLowerCase()
                          )
                          .map((ord) => (
                            <div
                              key={ord.id}
                              className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between text-xs font-mono"
                            >
                              <div>
                                <span className="font-bold text-amber-300 block">{ord.orderNumber}</span>
                                <span className="text-[10px] text-neutral-500">
                                  {new Date(ord.createdAt).toLocaleString()} • {ord.items.length} items
                                </span>
                              </div>

                              <div className="text-right">
                                <span className="font-bold text-white block">
                                  {config.currencySymbol}{ord.total.toFixed(2)}
                                </span>
                                <span className="px-2 py-0.5 bg-neutral-850 rounded text-[9px] font-bold text-amber-400 uppercase">
                                  {ord.status}
                                </span>
                              </div>
                            </div>
                          ))}

                        {orders.filter(
                          (o) =>
                            o.customerId === selectedCustomer.id ||
                            o.customerEmail.toLowerCase() === selectedCustomer.email.toLowerCase()
                        ).length === 0 && (
                          <div className="py-6 text-center text-neutral-500 bg-neutral-950 rounded-xl border border-neutral-800">
                            No orders placed yet by this customer.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Wishlisted items */}
                    {selectedCustomer.wishlist && selectedCustomer.wishlist.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-neutral-800">
                        <div className="flex items-center gap-1.5 text-neutral-300 font-bold uppercase tracking-wider text-[11px]">
                          <Heart className="w-3.5 h-3.5 text-rose-400" />
                          <span>Saved In Wishlist ({selectedCustomer.wishlist.length})</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedCustomer.wishlist.map((pId) => {
                            const p = products.find((prod) => prod.id === pId);
                            if (!p) return null;
                            return (
                              <div
                                key={p.id}
                                className="flex items-center gap-2 p-2 bg-neutral-950 rounded-lg border border-neutral-800 text-xs"
                              >
                                <img src={p.image} alt={p.title} className="w-8 h-10 object-cover rounded" />
                                <div className="truncate flex-1">
                                  <span className="text-white block truncate">{p.title}</span>
                                  <span className="text-amber-400 font-mono text-[10px]">
                                    {config.currencySymbol}{p.price}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

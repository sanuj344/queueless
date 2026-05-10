import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import api from '../../utils/api';
import Spinner from '../../components/Spinner';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'FOOD', 'SALON'
  
  // Modal State
  const [selectedVendor, setSelectedVendor] = useState(null);

  const fetchVendors = async () => {
    try {
      const res = await api.get('/admin/vendors');
      if (res.data && res.data.success) {
        setVendors(res.data.data || []);
      } else {
        setError('Unexpected API response format');
      }
    } catch (err) {
      console.error("[VendorsPage] Fetch Error:", err);
      setError('Failed to fetch vendors. ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleApproval = async (id, isApproved) => {
    try {
      await api.patch(`/admin/vendor/${id}`, { isApproved });
      setVendors(prev => prev.map(v => v.id === id ? { ...v, isApproved } : v));
      if (selectedVendor && selectedVendor.id === id) {
        setSelectedVendor({ ...selectedVendor, isApproved });
      }
    } catch (err) {
      console.error("[VendorsPage] Update Error:", err);
      alert('Failed to update vendor status');
    }
  };

  const filteredVendors = (vendors || []).filter(v => {
    const name = (v.name || '').toLowerCase();
    const outlet = (v.outletName || '').toLowerCase();
    const phone = (v.mobile || '').toLowerCase();
    const email = (v.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    
    const matchesSearch = name.includes(search) || outlet.includes(search) || phone.includes(search) || email.includes(search);
    
    const vType = (v.vendorType || 'food').toUpperCase();
    const matchesFilter = filterType === 'ALL' || vType === filterType;

    return matchesSearch && matchesFilter;
  });

  const stats = [
    { label: 'Total Vendors', value: (vendors || []).length, icon: '🏪' },
    { label: 'Food Vendors', value: (vendors || []).filter(v => (v.vendorType || 'food') === 'food').length, icon: '🍔' },
    { label: 'Salon Vendors', value: (vendors || []).filter(v => v.vendorType === 'salon').length, icon: '✂️' },
  ];

  if (isLoading) return (
    <AdminLayout>
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* KPI Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, idx) => (
            <Card key={idx} className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">{stat.label}</h3>
                  <span className="text-2xl font-black text-zinc-900 dark:text-white">{stat.value}</span>
                </div>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </Card>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-800/50 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Vendors Table */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 overflow-hidden relative min-h-[400px]">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-[#8cb800] dark:text-[#d4ff00]">
              Vendor Management <span className="text-sm font-normal text-zinc-500">({filteredVendors.length})</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              
              {/* Type Filter */}
              <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl w-full sm:w-auto">
                {['ALL', 'FOOD', 'SALON'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === type ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Search */}
              <input 
                type="text" 
                placeholder="Search vendor, owner, phone..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#8cb800] dark:focus:border-[#d4ff00] w-full sm:w-64 text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950/50 text-[10px] uppercase font-bold text-zinc-500 tracking-widest">
                  <th className="px-6 py-4">Vendor & Outlet</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Business Stats</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-3xl mb-3">🏪</span>
                        <p className="text-zinc-500 text-sm font-medium">No vendors found.</p>
                        {vendors.length > 0 && <p className="text-zinc-400 text-xs mt-1">Try adjusting your filters.</p>}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor) => {
                    const isSalon = vendor.vendorType === 'salon';
                    return (
                      <tr key={vendor.id} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setSelectedVendor(vendor)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-sm font-bold text-[#8cb800] dark:text-[#d4ff00]">
                              {(vendor.outletName || vendor.name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-zinc-900 dark:text-white">{vendor.outletName || vendor.name || 'Untitled'}</p>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-tight">{vendor.name || 'Unknown Owner'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={isSalon ? 'purple' : 'orange'}>
                            {isSalon ? 'SALON' : 'FOOD'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">{vendor.email || '—'}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{vendor.mobile}</p>
                        </td>
                        <td className="px-6 py-4">
                          {isSalon ? (
                            <>
                              <p className="text-xs text-zinc-600 dark:text-zinc-400"><span className="font-bold">Stylists:</span> {vendor.stylists?.length || 0}</p>
                              <p className="text-[10px] text-zinc-500 mt-0.5">Slot: {vendor.slotDuration || 30} mins</p>
                            </>
                          ) : (
                            <>
                              <p className="text-xs text-zinc-600 dark:text-zinc-400"><span className="font-bold">Prep:</span> {vendor.averagePrepTime || 10} mins</p>
                              <p className="text-[10px] text-zinc-500 mt-0.5">{vendor.hasGst ? 'GST Active' : 'No GST'}</p>
                            </>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={vendor.isApproved ? 'green' : 'zinc'}>
                            {vendor.isApproved ? 'Verified' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            {!vendor.isApproved ? (
                              <Button 
                                size="xs" 
                                onClick={() => handleApproval(vendor.id, true)}
                                className="bg-[#8cb800]/10 dark:bg-[#d4ff00]/10 text-[#8cb800] dark:text-[#d4ff00] hover:bg-[#8cb800]/20 dark:hover:bg-[#d4ff00]/20 border-none px-3"
                              >
                                Approve
                              </Button>
                            ) : (
                              <Button 
                                size="xs" 
                                onClick={() => handleApproval(vendor.id, false)}
                                className="bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-500/20 border-none px-3"
                              >
                                Revoke
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Vendor Details Modal */}
        {selectedVendor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedVendor(null)}>
            <div 
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xl font-black text-[#8cb800] dark:text-[#d4ff00]">
                    {(selectedVendor.outletName || selectedVendor.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-black text-zinc-900 dark:text-white">
                        {selectedVendor.outletName || selectedVendor.name || 'Untitled Business'}
                      </h2>
                      <Badge variant={selectedVendor.vendorType === 'salon' ? 'purple' : 'orange'}>
                        {selectedVendor.vendorType === 'salon' ? 'SALON' : 'FOOD'}
                      </Badge>
                      <Badge variant={selectedVendor.isApproved ? 'green' : 'zinc'}>
                        {selectedVendor.isApproved ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-500 font-medium">Owner: {selectedVendor.name}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedVendor(null)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                  ✕
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
                
                {/* Contact & Location */}
                <div>
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Contact & Location</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Phone</p>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">{selectedVendor.mobile}</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Email</p>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{selectedVendor.email || '—'}</p>
                    </div>
                    <div className="col-span-2 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Address</p>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                        {[selectedVendor.address, selectedVendor.city, selectedVendor.state, selectedVendor.pincode].filter(Boolean).join(', ') || 'Address not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Business specific Details */}
                <div>
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Business Settings</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">GST Number</p>
                      <p className="text-sm font-mono font-semibold text-zinc-900 dark:text-white">{selectedVendor.gstNumber || '—'}</p>
                    </div>
                    {selectedVendor.vendorType === 'salon' ? (
                      <>
                        <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Active Stylists</p>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">{selectedVendor.stylists?.length || 0}</p>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Slot Duration</p>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">{selectedVendor.slotDuration || 30} mins</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Avg Prep Time</p>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">{selectedVendor.averagePrepTime || 10} mins</p>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Joined Date</p>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">{new Date(selectedVendor.createdAt).toLocaleDateString()}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Bank Details */}
                <div>
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Bank Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Bank Name</p>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">{selectedVendor.bankName || '—'}</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Account Holder</p>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">{selectedVendor.accountHolderName || '—'}</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Account Number</p>
                      <p className="text-sm font-mono font-semibold text-zinc-900 dark:text-white">
                        {selectedVendor.accountNumber ? `*${selectedVendor.accountNumber.slice(-4)}` : '—'}
                      </p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">IFSC / UPI</p>
                      <p className="text-sm font-mono font-semibold text-zinc-900 dark:text-white">
                        {selectedVendor.ifscCode || selectedVendor.upiId || '—'}
                      </p>
                    </div>
                  </div>
                </div>
                
              </div>
              <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-end gap-3 rounded-b-3xl">
                {!selectedVendor.isApproved ? (
                  <Button 
                    onClick={() => handleApproval(selectedVendor.id, true)}
                    className="bg-[#d4ff00] text-black hover:bg-[#c0e600] font-black border-none"
                  >
                    Approve Vendor
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleApproval(selectedVendor.id, false)}
                    className="bg-red-500 text-white hover:bg-red-600 font-bold border-none"
                  >
                    Revoke Approval
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

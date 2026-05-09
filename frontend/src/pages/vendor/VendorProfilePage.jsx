import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function VendorProfilePage() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // General Details State
  const [generalData, setGeneralData] = useState({
    outletName: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: '',
    storeDescription: '',
    averagePrepTime: '',
    profileImage: ''
  });

  // Bank Details State
  const [bankData, setBankData] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    branchName: ''
  });

  useEffect(() => {
    if (user) {
      setGeneralData({
        outletName: user.outletName || user.name || '',
        mobile: user.mobile || '',
        email: user.email || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        gstNumber: user.gstNumber || '',
        storeDescription: user.storeDescription || '',
        averagePrepTime: user.averagePrepTime || '',
        profileImage: user.profileImage || ''
      });

      setBankData({
        accountHolderName: user.accountHolderName || '',
        bankName: user.bankName || '',
        accountNumber: user.accountNumber || '',
        ifscCode: user.ifscCode || '',
        upiId: user.upiId || '',
        branchName: user.branchName || ''
      });
    }
  }, [user]);

  const handleGeneralChange = (e) => {
    setGeneralData({ ...generalData, [e.target.name]: e.target.value });
  };

  const handleBankChange = (e) => {
    setBankData({ ...bankData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = activeTab === 'general' ? generalData : bankData;
      const res = await api.patch('/vendor/profile', payload);
      setUser(res.data.data);
      toast.success(`${activeTab === 'general' ? 'General' : 'Bank'} details updated successfully!`);
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const maskAccount = (acc) => {
    if (!acc || acc.length < 4) return acc;
    return '*'.repeat(acc.length - 4) + acc.slice(-4);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Vendor Profile</h1>
            <p className="text-zinc-500 mt-1">Manage your business and payout details</p>
          </div>
          <div className="flex bg-zinc-200 dark:bg-zinc-800 p-1 rounded-xl w-fit">
            <button
              onClick={() => { setActiveTab('general'); setIsEditing(false); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'general' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
            >
              General Details
            </button>
            <button
              onClick={() => { setActiveTab('bank'); setIsEditing(false); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'bank' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
            >
              Bank Details
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex justify-between items-center mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <h2 className="text-xl font-black text-zinc-900 dark:text-white">
              {activeTab === 'general' ? 'Business Information' : 'Payout Configuration'}
            </h2>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Edit Details
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-[#d4ff00] text-black rounded-lg text-sm font-bold hover:bg-[#c0e600] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          {activeTab === 'general' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Profile Image URL</label>
                {isEditing ? (
                  <input type="text" name="profileImage" value={generalData.profileImage} onChange={handleGeneralChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00]" placeholder="https://example.com/logo.png" />
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700">
                      {generalData.profileImage ? <img src={generalData.profileImage} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-xl font-black text-zinc-400">{user?.name?.charAt(0).toUpperCase()}</span>}
                    </div>
                    {generalData.profileImage ? <p className="text-sm text-emerald-500 font-bold">Image Set</p> : <p className="text-sm text-zinc-400">No image uploaded</p>}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Business Name</label>
                {isEditing ? <input type="text" name="outletName" value={generalData.outletName} onChange={handleGeneralChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00]" /> : <p className="font-bold text-zinc-900 dark:text-white p-2.5">{generalData.outletName || '—'}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Owner Contact</label>
                {isEditing ? <input type="text" name="mobile" value={generalData.mobile} onChange={handleGeneralChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00]" /> : <p className="font-bold text-zinc-900 dark:text-white p-2.5">{generalData.mobile || '—'}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Email Address</label>
                {isEditing ? <input type="email" name="email" value={generalData.email} onChange={handleGeneralChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00]" /> : <p className="font-bold text-zinc-900 dark:text-white p-2.5">{generalData.email || '—'}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">GST Number</label>
                {isEditing ? <input type="text" name="gstNumber" value={generalData.gstNumber} onChange={handleGeneralChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00]" /> : <p className="font-bold text-zinc-900 dark:text-white p-2.5">{generalData.gstNumber || '—'}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Shop Address</label>
                {isEditing ? <input type="text" name="address" value={generalData.address} onChange={handleGeneralChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00]" /> : <p className="font-bold text-zinc-900 dark:text-white p-2.5">{generalData.address || '—'}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">City</label>
                {isEditing ? <input type="text" name="city" value={generalData.city} onChange={handleGeneralChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00]" /> : <p className="font-bold text-zinc-900 dark:text-white p-2.5">{generalData.city || '—'}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">State</label>
                  {isEditing ? <input type="text" name="state" value={generalData.state} onChange={handleGeneralChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00]" /> : <p className="font-bold text-zinc-900 dark:text-white p-2.5">{generalData.state || '—'}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Pincode</label>
                  {isEditing ? <input type="text" name="pincode" value={generalData.pincode} onChange={handleGeneralChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00]" /> : <p className="font-bold text-zinc-900 dark:text-white p-2.5">{generalData.pincode || '—'}</p>}
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Store Description</label>
                {isEditing ? <textarea name="storeDescription" value={generalData.storeDescription} onChange={handleGeneralChange} rows={3} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00] resize-none" /> : <p className="font-bold text-zinc-900 dark:text-white p-2.5">{generalData.storeDescription || '—'}</p>}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
                <p className="text-sm text-blue-700 dark:text-blue-400 font-bold">🔒 Bank details are encrypted and securely stored for payouts.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Account Holder Name</label>
                {isEditing ? <input type="text" name="accountHolderName" value={bankData.accountHolderName} onChange={handleBankChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00]" /> : <p className="font-bold text-zinc-900 dark:text-white p-2.5">{bankData.accountHolderName || '—'}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Bank Name</label>
                {isEditing ? <input type="text" name="bankName" value={bankData.bankName} onChange={handleBankChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00]" /> : <p className="font-bold text-zinc-900 dark:text-white p-2.5">{bankData.bankName || '—'}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Account Number</label>
                {isEditing ? <input type="password" name="accountNumber" value={bankData.accountNumber} onChange={handleBankChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00]" placeholder="Enter account number" /> : <p className="font-bold text-zinc-900 dark:text-white p-2.5 font-mono">{bankData.accountNumber ? maskAccount(bankData.accountNumber) : '—'}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">IFSC Code</label>
                {isEditing ? <input type="text" name="ifscCode" value={bankData.ifscCode} onChange={handleBankChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00] uppercase" /> : <p className="font-bold text-zinc-900 dark:text-white p-2.5 font-mono">{bankData.ifscCode || '—'}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Branch Name</label>
                {isEditing ? <input type="text" name="branchName" value={bankData.branchName} onChange={handleBankChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00]" /> : <p className="font-bold text-zinc-900 dark:text-white p-2.5">{bankData.branchName || '—'}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">UPI ID (Optional)</label>
                {isEditing ? <input type="text" name="upiId" value={bankData.upiId} onChange={handleBankChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00]" /> : <p className="font-bold text-zinc-900 dark:text-white p-2.5 font-mono">{bankData.upiId || '—'}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

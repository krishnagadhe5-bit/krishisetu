import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Store,
  Search,
  Filter,
  MapPin,
  Calendar,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const MarketplacePage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [orderModalListing, setOrderModalListing] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const districts = [
    'All', 'Pune', 'Nashik', 'Nagpur', 'Solapur', 'Kolhapur',
    'Ahmednagar', 'Chhatrapati Sambhajinagar', 'Sangli', 'Satara', 'Amravati'
  ];

  // Fetch active produce lots from public marketplace API
  useEffect(() => {
    fetchListings();
  }, [selectedDistrict, selectedGrade]);

  const fetchListings = () => {
    setLoading(true);
    const params = {};
    if (selectedDistrict !== 'All') params.district = selectedDistrict;
    if (selectedGrade !== 'All') params.qualityGrade = selectedGrade;

    api.get('/marketplace', { params })
      .then((res) => {
        setListings(res.data.data || []);
      })
      .catch((err) => {
        console.error('Error fetching marketplace listings:', err);
        toast.error('Unable to fetch live marketplace lots');
      })
      .finally(() => setLoading(false));
  };

  const filteredListings = listings.filter((item) => {
    const term = search.toLowerCase();
    const titleMatch = item.title?.toLowerCase().includes(term);
    const cropMatch = item.crop?.name?.toLowerCase().includes(term) || item.crop?.nameMr?.includes(term);
    const locationMatch = item.pickupAddress?.toLowerCase().includes(term);
    return titleMatch || cropMatch || locationMatch;
  });

  const handleBuyClick = (listing) => {
    if (!isAuthenticated) {
      toast('Please sign in to submit purchase orders or inquiries', { icon: '🔐' });
      navigate('/login');
      return;
    }
    if (user.role === 'FARMER') {
      toast('Farmers list produce. Switch to Buyer or register a Buyer account to place orders.', { icon: 'ℹ️' });
      return;
    }
    setOrderModalListing(listing);
    setOrderQuantity(Math.min(100, listing.availableQtyKg || listing.quantityKg).toString());
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (!orderQuantity || Number(orderQuantity) <= 0) {
      toast.error('Please enter a valid quantity in kg');
      return;
    }
    if (Number(orderQuantity) > (orderModalListing.availableQtyKg || orderModalListing.quantityKg)) {
      toast.error('Requested quantity exceeds available stock');
      return;
    }

    setSubmittingOrder(true);
    try {
      await api.post('/orders', {
        items: [
          {
            listingId: orderModalListing.id,
            quantityKg: Number(orderQuantity),
          },
        ],
        deliveryAddress: user.profile?.district ? `${user.profile.district}, Maharashtra` : 'Maharashtra Delivery',
        deliveryMethod: 'DIRECT_DISPATCH',
      });

      toast.success('Purchase order created successfully! Check your Buyer portal.');
      setOrderModalListing(null);
      fetchListings(); // Refresh stock
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col">
      <Navbar />
      <Toaster position="top-right" />

      {/* Header Banner */}
      <section className="bg-gradient-to-b from-white to-[#f4f8f3] border-b border-gray-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-agri-100 text-agri-900 text-xs font-semibold mb-2">
              <Store className="w-3.5 h-3.5 text-agri-700" />
              KrishiSetu Verified B2B Agricultural Mandi
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Direct Farmer-to-Buyer Marketplace
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-2xl">
              Source freshly harvested produce directly from verified Maharashtra farmers with transparent quality grades, origin verification, and guaranteed price fair trade.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && user?.role === 'FARMER' ? (
              <Link
                to="/portal/farmer/listings"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs shadow-md shadow-agri-700/20 transition"
              >
                <Tag className="w-4 h-4" />
                List Your Harvest
              </Link>
            ) : isAuthenticated && user?.role === 'BUYER' ? (
              <Link
                to="/portal/buyer/orders"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-harvest-600 hover:bg-harvest-700 text-white font-bold text-xs shadow-md shadow-harvest-600/20 transition"
              >
                <ShoppingBag className="w-4 h-4" />
                My Purchase Orders
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs shadow-md shadow-agri-700/20 transition"
              >
                Register to Buy or Sell
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Main Catalog View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by crop, variety, or district..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-agri-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">District:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-agri-500"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Quality Grade:</span>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-agri-500"
              >
                <option value="All">All Grades</option>
                <option value="GRADE_A">Grade A (Premium)</option>
                <option value="GRADE_B">Grade B (Standard)</option>
                <option value="GRADE_C">Grade C (Processing)</option>
                <option value="ORGANIC">Certified Organic</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-agri-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-500 mt-3 font-medium">Loading verified Maharashtra produce listings...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-lg mx-auto shadow-sm">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">No Produce Listings Found</h3>
            <p className="text-xs text-gray-500 mt-1">
              There are currently no active lots matching your filter criteria. Try selecting "All" districts or adjust search terms.
            </p>
            {isAuthenticated && user?.role === 'FARMER' && (
              <Link
                to="/portal/farmer/listings"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-agri-700 text-white text-xs font-semibold"
              >
                Create First Lot Listing
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((item) => {
              const availableQty = item.availableQtyKg || item.quantityKg;
              const pricePerKg = Number(item.pricePerKg);
              const pricePerQuintal = pricePerKg * 100;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
                >
                  <div className="p-6">
                    {/* Top Row: Crop & Quality */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-bold text-gray-900">{item.crop?.name || 'Produce Lot'}</span>
                        {item.crop?.nameMr && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-agri-100 text-agri-800 font-medium">
                            {item.crop.nameMr}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {item.qualityGrade ? item.qualityGrade.replace('_', ' ') : 'Standard'}
                      </span>
                    </div>

                    {/* Listing Title & Description */}
                    <h3 className="text-base font-bold text-gray-900 mt-3">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description || 'Verified agricultural lot grown in Maharashtra agro-climatic conditions.'}
                    </p>

                    {/* Quantity & Location Meta */}
                    <div className="mt-4 grid grid-cols-2 gap-2 bg-[#fafcf9] p-3 rounded-2xl border border-gray-100 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-medium">Available Quantity</span>
                        <span className="font-extrabold text-gray-900">
                          {availableQty >= 1000
                            ? `${(availableQty / 1000).toFixed(1)} Tonnes`
                            : availableQty >= 100
                            ? `${(availableQty / 100).toFixed(1)} Quintals`
                            : `${availableQty} kg`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-medium">Harvest Date</span>
                        <span className="font-semibold text-gray-700">
                          {item.harvestDate ? new Date(item.harvestDate).toLocaleDateString() : 'Fresh Lot'}
                        </span>
                      </div>
                    </div>

                    {/* Pickup Address */}
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-600">
                      <MapPin className="w-3.5 h-3.5 text-agri-600 flex-shrink-0" />
                      <span className="truncate">{item.pickupAddress || 'Maharashtra APMC Hub'}</span>
                    </div>

                    {/* Seller details */}
                    <div className="mt-2 text-[11px] text-gray-500">
                      Farmer: <span className="font-semibold text-gray-700">{item.user?.profile?.fullName || 'Verified Farmer'}</span>
                    </div>
                  </div>

                  {/* Pricing & CTA footer */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 block">Asking Rate</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-agri-950">₹{pricePerKg}</span>
                        <span className="text-[10px] text-gray-500">/ kg</span>
                        <span className="text-[10px] text-gray-400 ml-1">
                          (₹{pricePerQuintal.toLocaleString()}/q)
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuyClick(item)}
                      className="px-4 py-2 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs shadow-sm transition"
                    >
                      Place Order
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Purchase Order Modal */}
      {orderModalListing && (
        <div className="fixed inset-0 z-50 !m-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Confirm Purchase Order</h3>
              <button
                onClick={() => setOrderModalListing(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmOrder} className="mt-4 space-y-4">
              <div>
                <span className="text-xs text-gray-500 block">Selected Lot:</span>
                <p className="text-sm font-bold text-gray-900">{orderModalListing.title}</p>
                <p className="text-xs text-agri-700 font-medium">Rate: ₹{orderModalListing.pricePerKg} / kg</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Quantity to Purchase (kg)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={orderModalListing.availableQtyKg || orderModalListing.quantityKg}
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-agri-500 focus:outline-none"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Available stock: {orderModalListing.availableQtyKg || orderModalListing.quantityKg} kg
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                <div className="flex items-center justify-between font-medium text-gray-600">
                  <span>Subtotal:</span>
                  <span>₹{(Number(orderQuantity || 0) * Number(orderModalListing.pricePerKg)).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between font-extrabold text-agri-950 text-sm mt-1 pt-1 border-t border-gray-200">
                  <span>Estimated Total:</span>
                  <span>₹{(Number(orderQuantity || 0) * Number(orderModalListing.pricePerKg)).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOrderModalListing(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-agri-700 hover:bg-agri-800 text-white shadow-md transition disabled:opacity-50"
                >
                  {submittingOrder ? 'Reserving Inventory...' : 'Confirm & Reserve Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

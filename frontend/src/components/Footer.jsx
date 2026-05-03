import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomerLoginModal from "./CustomerLoginModal";

const Footer = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);

  const handleReferVendorClick = () => {
    const customer = JSON.parse(localStorage.getItem('ql_customer'));
    if (!customer || !customer.phone) {
      setShowLogin(true);
    } else {
      navigate('/refer-vendor');
    }
  };

  return (
    <footer className="bg-black text-gray-400 px-10 py-12 mt-20">
      
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">

        {/* BRAND */}
        <div>
          <h1 className="text-white text-2xl font-bold">
            Queue<span className="text-lime-400">Less</span>
          </h1>
          <p className="mt-4 text-sm text-zinc-500">
            The ultimate quick-service operating system.
            Modular. Rapid. Reliable.
          </p>
        </div>

        {/* EXPLORE */}
        <div>
          <h2 className="text-lime-400 font-semibold mb-4">EXPLORE</h2>
          <ul className="space-y-2">
            <li>
              <button
                onClick={handleReferVendorClick}
                className="hover:text-white cursor-pointer transition-colors text-sm text-left block w-full"
              >
                Refer a Vendor
              </button>
            </li>
            <li><Link to="/vendor/register" className="hover:text-white cursor-pointer transition-colors text-sm">Become a Vendor</Link></li>
            <li><Link to="/customer-hub" className="hover:text-white cursor-pointer transition-colors text-sm">Customer Hub</Link></li>
            <li><Link to="/about" className="hover:text-white cursor-pointer transition-colors text-sm">About Us</Link></li>
          </ul>
        </div>

        {/* LEGAL */}
        <div>
          <h2 className="text-lime-400 font-semibold mb-4">LEGAL</h2>
          <ul className="space-y-2">
            <li><Link to="/terms" className="hover:text-white cursor-pointer transition-colors text-sm">Terms & Conditions</Link></li>
            <li><Link to="/privacy" className="hover:text-white cursor-pointer transition-colors text-sm">Privacy Policy</Link></li>
            <li><Link to="/refund" className="hover:text-white cursor-pointer transition-colors text-sm">Refund Policy</Link></li>
            <li><Link to="/disclaimer" className="hover:text-white cursor-pointer transition-colors text-sm">Disclaimer</Link></li>
          </ul>
        </div>

        {/* SUPPORT */}
        <div>
          <h2 className="text-lime-400 font-semibold mb-4">SUPPORT</h2>
          <ul className="space-y-2">
            <li><Link to="/help-desk" className="hover:text-white cursor-pointer transition-colors text-sm">Help Desk</Link></li>
            <li><Link to="/faqs" className="hover:text-white cursor-pointer transition-colors text-sm">FAQs</Link></li>
            <li><Link to="/report-issue" className="hover:text-white cursor-pointer transition-colors text-sm">Report Issue</Link></li>
            <li><Link to="/contact" className="hover:text-white cursor-pointer transition-colors text-sm">Contact Center</Link></li>
          </ul>
        </div>

      </div>

      {/* BOTTOM LINE */}
      <div className="max-w-7xl mx-auto border-t border-gray-800 mt-10 pt-6 text-sm text-center text-zinc-600">
        © 2026 QueueLess. All rights reserved.
      </div>

      <CustomerLoginModal
        isOpen={showLogin}
        onClose={() => {
          setShowLogin(false);
          const customer = JSON.parse(localStorage.getItem('ql_customer'));
          if (customer && customer.phone) {
            navigate('/refer-vendor');
          }
        }}
      />
    </footer>
  );
};

export default Footer;

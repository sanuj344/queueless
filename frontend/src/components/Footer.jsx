import React from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
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

        {/* ECOSYSTEM */}
        <div>
          <h2 className="text-lime-400 font-semibold mb-4">ECOSYSTEM</h2>
          <ul className="space-y-2">
            <li onClick={() => alert("Coming soon")} className="hover:text-white cursor-pointer transition-colors">Merchant App</li>
            <li onClick={() => alert("Coming soon")} className="hover:text-white cursor-pointer transition-colors">Customer Hub</li>
            <li onClick={() => alert("Coming soon")} className="hover:text-white cursor-pointer transition-colors">Admin Panel</li>
            <li onClick={() => alert("Coming soon")} className="hover:text-white cursor-pointer transition-colors">QR Generator</li>
          </ul>
        </div>

        {/* CORPORATE */}
        <div>
          <h2 className="text-lime-400 font-semibold mb-4">CORPORATE</h2>
          <ul className="space-y-2">
            <li onClick={() => alert("Coming soon")} className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
            <li onClick={() => alert("Coming soon")} className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
            <li onClick={() => alert("Coming soon")} className="hover:text-white cursor-pointer transition-colors">Cookie Policy</li>
            <li onClick={() => alert("Coming soon")} className="hover:text-white cursor-pointer transition-colors">Brand Assets</li>
          </ul>
        </div>

        {/* SUPPORT */}
        <div>
          <h2 className="text-lime-400 font-semibold mb-4">SUPPORT</h2>
          <ul className="space-y-2">
            <li onClick={() => navigate("/help-desk")} className="hover:text-white cursor-pointer transition-colors">Help Desk</li>
            <li onClick={() => alert("Coming soon")} className="hover:text-white cursor-pointer transition-colors">API Docs</li>
            <li onClick={() => alert("Coming soon")} className="hover:text-white cursor-pointer transition-colors">Status Page</li>
            <li onClick={() => alert("Coming soon")} className="hover:text-white cursor-pointer transition-colors">Contact Centre</li>
          </ul>
        </div>

      </div>

      {/* BOTTOM LINE */}
      <div className="max-w-7xl mx-auto border-t border-gray-800 mt-10 pt-6 text-sm text-center text-zinc-600">
        © 2026 QueueLess. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

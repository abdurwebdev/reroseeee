import React from "react";
import { FaInstagram, FaLinkedin, FaDiscord, FaYoutube, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Social Media Section */}
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl">⚔️</h1>
            <p className="text-lg font-semibold">Let’s connect with our socials</p>
          </div>
          <div className="flex space-x-4 mt-4">
            <FaInstagram className="text-2xl cursor-pointer hover:text-gray-400" />
            <FaLinkedin className="text-2xl cursor-pointer hover:text-gray-400" />
            <FaDiscord className="text-2xl cursor-pointer hover:text-gray-400" />
            <FaYoutube className="text-2xl cursor-pointer hover:text-gray-400" />
            <FaTwitter className="text-2xl cursor-pointer hover:text-gray-400" />
          </div>
        </div>

        {/* Company Section */}
        <div>
          <h3 className="text-xl font-bold mb-3">COMPANY</h3>
          <ul className="space-y-2 text-gray-400">
            <li className="hover:text-white cursor-pointer">About Us</li>
            <li className="hover:text-white cursor-pointer">Support</li>
            <li className="hover:text-white cursor-pointer">Privacy Policy</li>
            <li className="hover:text-white cursor-pointer">Terms and Condition</li>
            <li className="hover:text-white cursor-pointer">Pricing and Refund</li>
            <li className="hover:text-white cursor-pointer">Hire From Us</li>
          </ul>
        </div>

        {/* Community Section */}
        <div>
          <h3 className="text-xl font-bold mb-3">COMMUNITY</h3>
          <ul className="space-y-2 text-gray-400">
            <li className="hover:text-white cursor-pointer">Inertia</li>
            <li className="hover:text-white cursor-pointer">Discord</li>
          </ul>
        </div>

        {/* Contact Section */}
        <div>
          <h3 className="text-xl font-bold mb-3">Get In Touch</h3>
          <p className="text-gray-400">0319-5812209</p>
          <p className="text-gray-400">03110168186</p>
          <p className="text-gray-400">hello@rerose.com</p>
          <p className="text-gray-400 mt-2">Block No J3 Flat No 08 Yousaf Colony Westridge III Rawalpindi</p>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-gray-700 mt-10 pt-4 text-center text-gray-500">
        Copyright © 2025 Rerose Academy. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;

import React from "react";
import { Link } from "react-router-dom";
import whiteLogo from "../../assets/white-logo-cropped.svg";

const Footer = () => {
  return (
    <footer className="mt-4 bg-[#1c1d1f] text-white py-8">
      <div className="max-w-[134rem] mx-auto px-[2.4rem]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-8">
            <Link
              to="/about"
              className="text-white hover:text-gray-300 text-sm"
            >
              About us
            </Link>
            <Link
              to="/contact"
              className="text-white hover:text-gray-300 text-sm"
            >
              Contact us
            </Link>
            <Link
              to="/terms"
              className="text-white hover:text-gray-300 text-sm"
            >
              Terms and conditions
            </Link>
            <Link
              to="/privacy"
              className="text-white hover:text-gray-300 text-sm"
            >
              Privacy policy
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <img
                src={whiteLogo}
              alt="Vidhyara"
              className="h-8"
            />
            <span className="text-sm text-gray-300">
              &copy; {new Date().getFullYear()} Vidhyara, Inc.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

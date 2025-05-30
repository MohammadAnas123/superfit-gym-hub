
const Footer = () => {
  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-red-500 mb-4">SUPERFIT</h3>
            <p className="text-gray-300 mb-4">
              Transform your body, elevate your mind, and unleash your potential at the ultimate fitness destination.
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center hover:bg-red-500 cursor-pointer transition-colors">
                <span className="text-sm">f</span>
              </div>
              <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center hover:bg-red-500 cursor-pointer transition-colors">
                <span className="text-sm">t</span>
              </div>
              <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center hover:bg-red-500 cursor-pointer transition-colors">
                <span className="text-sm">i</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#home" className="hover:text-red-500 transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-red-500 transition-colors">About</a></li>
              <li><a href="#packages" className="hover:text-red-500 transition-colors">Packages</a></li>
              <li><a href="#gallery" className="hover:text-red-500 transition-colors">Gallery</a></li>
              <li><a href="#contact" className="hover:text-red-500 transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Personal Training</li>
              <li>Group Classes</li>
              <li>Nutrition Counseling</li>
              <li>Fitness Assessment</li>
              <li>Meal Planning</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 SuperFit Gym. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

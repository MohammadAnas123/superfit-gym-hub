
const Hero = () => {
  return (
    <section id="home" className="relative h-screen flex items-center justify-center bg-gradient-to-r from-black via-gray-900 to-black">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-6xl md:text-8xl font-bold mb-6">
          SUPER<span className="text-red-500">FIT</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Transform your body, elevate your mind, and unleash your potential at the ultimate fitness destination.
        </p>
        <div className="space-x-4">
          <button className="bg-red-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-red-600 transition-colors">
            Start Your Journey
          </button>
          <button className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-black transition-colors">
            View Packages
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;

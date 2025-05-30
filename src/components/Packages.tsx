
import { Check } from 'lucide-react';

const Packages = () => {
  const packages = [
    {
      name: "Basic",
      price: "₹1,500",
      period: "/month",
      features: [
        "Gym access during peak hours",
        "Basic equipment usage",
        "Locker facility",
        "1 free fitness assessment"
      ],
      popular: false
    },
    {
      name: "Premium",
      price: "₹2,500",
      period: "/month",
      features: [
        "24/7 gym access",
        "All equipment access",
        "Personal trainer (2 sessions/month)",
        "Nutritional consultation",
        "Group classes included",
        "Premium locker"
      ],
      popular: true
    },
    {
      name: "Elite",
      price: "₹4,000",
      period: "/month",
      features: [
        "Everything in Premium",
        "Unlimited personal training",
        "Custom meal plans",
        "Body composition analysis",
        "Priority booking",
        "Supplement guidance",
        "Guest passes (2/month)"
      ],
      popular: false
    }
  ];

  return (
    <section id="packages" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Membership Packages</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your fitness journey. All packages include access to our 
            world-class facilities and expert guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <div 
              key={index} 
              className={`relative p-8 rounded-2xl ${
                pkg.popular 
                  ? 'bg-red-500 text-white shadow-2xl scale-105' 
                  : 'bg-gray-50 text-gray-900 shadow-lg'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                <div className="flex items-end justify-center">
                  <span className="text-4xl font-bold">{pkg.price}</span>
                  <span className={`text-lg ${pkg.popular ? 'text-red-100' : 'text-gray-500'}`}>
                    {pkg.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {pkg.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className={`h-5 w-5 mr-3 ${pkg.popular ? 'text-white' : 'text-red-500'}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  pkg.popular
                    ? 'bg-white text-red-500 hover:bg-gray-100'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Packages;

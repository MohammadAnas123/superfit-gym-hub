import { useState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { supabase } from "../lib/supabaseClient"; // make sure path is correct

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const contactInfo = [
    {
      icon: <MapPin className="h-6 w-6 text-red-500" />,
      title: "Address",
      details: "123 Fitness Street, Health City, HC 12345",
    },
    {
      icon: <Phone className="h-6 w-6 text-red-500" />,
      title: "Phone",
      details: "+91 98765 43210",
    },
    {
      icon: <Mail className="h-6 w-6 text-red-500" />,
      title: "Email",
      details: "info@superfit.com",
    },
    {
      icon: <Clock className="h-6 w-6 text-red-500" />,
      title: "Hours",
      details: "24/7 for Premium Members\n6 AM - 11 PM for Basic Members",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from("user_messages")
      .insert([{ name, email, phone, message }]);

    if (error) {
      console.error(error.message);
      setStatus("❌ Something went wrong. Try again!");
    } else {
      setStatus("✅ Message sent successfully!");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    }
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to start your fitness journey? Contact us today for a free
            consultation and tour.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Contact Information
            </h3>
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 mr-4">{info.icon}</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {info.title}
                    </h4>
                    <p className="text-gray-600 whitespace-pre-line">
                      {info.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Send us a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="tel"
                placeholder="Your Phone"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <textarea
                rows={4}
                placeholder="Your Message"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
              <button
                type="submit"
                className="w-full bg-red-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Send Message
              </button>
            </form>
            {status && (
              <p className="mt-4 text-center text-gray-700">{status}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

'use client';

import { Mail, MessageSquare, Phone, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';

interface ContactMethod {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: string;
}

const contactMethods: ContactMethod[] = [
  {
    icon: <Mail className="h-6 w-6" />,
    title: 'Email',
    description: 'We respond within 24 hours',
    value: 'support@thesisai.com',
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: 'Live Chat',
    description: 'Chat with our support team',
    value: 'Available 9 AM - 6 PM EST',
  },
  {
    icon: <Phone className="h-6 w-6" />,
    title: 'Phone',
    description: 'Call our support team',
    value: '+1 (555) 123-4567',
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    title: 'Office',
    description: 'Visit our headquarters',
    value: 'San Francisco, CA',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white">Contact Us</h1>
          <p className="mt-4 text-lg text-slate-300">
            We'd love to hear from you. Get in touch with our team.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-white">Get in touch</h2>
            <p className="mt-2 text-slate-300">
              Have a question? Our team is ready to help.
            </p>

            <div className="mt-8 space-y-6">
              {contactMethods.map((method) => (
                <div key={method.title}>
                  <div className="flex items-center gap-3 text-blue-400">
                    {method.icon}
                    <h3 className="font-semibold text-white">
                      {method.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    {method.description}
                  </p>
                  <p className="mt-1 font-medium text-slate-200">
                    {method.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Business Hours */}
            <div className="mt-8 rounded-lg bg-slate-800 p-4 border border-slate-700">
              <div className="flex items-center gap-2 text-blue-400 font-semibold">
                <Clock className="h-5 w-5" />
                Business Hours
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                <p>Monday - Friday: 9 AM - 6 PM EST</p>
                <p>Saturday: 10 AM - 4 PM EST</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitted && (
                <div className="rounded-lg bg-green-500/20 p-4 border border-green-500/50">
                  <p className="text-green-300 font-semibold">
                    Message sent successfully! We'll get back to you soon.
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-white">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select a subject</option>
                  <option value="support">Technical Support</option>
                  <option value="billing">Billing & Subscription</option>
                  <option value="feature">Feature Request</option>
                  <option value="feedback">General Feedback</option>
                  <option value="partnership">Partnership Inquiry</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Tell us how we can help..."
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Send Message
              </button>

              <p className="text-center text-sm text-slate-400">
                We typically respond within 24 hours during business days.
              </p>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 border-t border-slate-700 pt-16">
          <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
          <div className="mt-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white">
                What is your response time?
              </h3>
              <p className="mt-2 text-slate-300">
                We aim to respond to all support inquiries within 24 hours during business days. For urgent issues, please use our live chat feature.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                How do I reset my password?
              </h3>
              <p className="mt-2 text-slate-300">
                You can reset your password by clicking the "Forgot Password" link on the login page. You'll receive an email with instructions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Do you offer refunds?
              </h3>
              <p className="mt-2 text-slate-300">
                Yes, we offer a 30-day money-back guarantee if you're not satisfied with your subscription.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="mt-2 text-slate-300">
                Yes, you can change your plan anytime from your account settings. Changes take effect immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

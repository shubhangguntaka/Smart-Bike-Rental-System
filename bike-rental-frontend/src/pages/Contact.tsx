import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, HelpCircle, BadgeCheck } from "lucide-react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/common/Modal";
import toast from "react-hot-toast";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSuccessOpen(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1200);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-background min-h-screen text-foreground space-y-12">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
          Get In Touch
        </h1>
        <p className="text-base text-muted-foreground">
          Have queries about bike rentals, pricing, registrations, or franchise options? Drop us a line and our team will respond shortly.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
            <h3 className="text-lg font-bold">Contact Channels</h3>
            
            <div className="space-y-4 text-sm">
              <div className="flex gap-3.5 items-start">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-semibold">Email Support</p>
                  <a href="mailto:support@smartbike.com" className="text-xs text-muted-foreground hover:underline">
                    support@smartbike.com
                  </a>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-semibold">Helpline Numbers</p>
                  <p className="text-xs text-muted-foreground">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-semibold">HQ Address</p>
                  <p className="text-xs text-muted-foreground">
                    102, Startup Valley Phase 2,<br />Indiranagar, Bangalore 560038
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 text-xs text-muted-foreground flex gap-3">
            <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              We respond to normal support requests within 24 working hours. For ongoing booking emergencies, please trigger the Help option directly from your active rental dashboard page.
            </p>
          </div>
        </div>

        {/* Contact Form column */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
            <h3 className="text-lg font-bold mb-2">Send Message</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Your Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full text-xs px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/25 text-foreground"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full text-xs px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/25 text-foreground"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="KYC verification inquiry, billing issue, etc."
                className="w-full text-xs px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/25 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Your Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                placeholder="Provide detailed description of your request..."
                className="w-full text-xs px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/25 text-foreground"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 cursor-pointer shadow-sm hover:shadow flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />}
              <Send className="h-4 w-4" />
              <span>{loading ? "Sending..." : "Submit Message"}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      <Modal isOpen={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} size="sm">
        <ModalHeader onClose={() => setIsSuccessOpen(false)}>Message Dispatched</ModalHeader>
        <ModalBody className="text-center py-6 space-y-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
            <BadgeCheck className="h-8 w-8" />
          </div>
          <h4 className="font-bold text-sm text-foreground">Thank You for Reaching Out!</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your message has been received by our support administrators. We will get back to you via your registered email shortly.
          </p>
        </ModalBody>
        <ModalFooter align="justify-center">
          <button
            type="button"
            onClick={() => setIsSuccessOpen(false)}
            className="w-full px-4 py-2.5 text-xs font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-95 transition-all cursor-pointer"
          >
            Acknowledge
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

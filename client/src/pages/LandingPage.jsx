// pages/LandingPage.jsx
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Shield,
  Eye,
  Users,
  Bell,
  Cloud,
  Smartphone,
  CheckCircle,
  ArrowRight,
  Play,
  Star,
  Lock,
  Video,
  School,
  Clock,
  Zap,
  Globe,
  BarChart3,
  Building2,
  Factory,
  Hospital,
  Store,
  Warehouse,
  Settings,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const featuresRef = useRef(null);
  const statsRef = useRef(null);

  // Animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(
              "animate-in",
              "fade-in",
              "slide-in-from-bottom-4",
            );
            entry.target.classList.remove("opacity-0");
          }
        });
      },
      { threshold: 0.1 },
    );

    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleAdminLogin = () => {
    navigate("/admin-login");
  };

  const handleUserPortal = () => {
    navigate("/user-portal");
  };

  // Industries we serve
  const industries = [
    { icon: School, name: "Schools & Education", color: "blue" },
    { icon: Hospital, name: "Hospitals & Healthcare", color: "green" },
    { icon: Building2, name: "Corporate Offices", color: "purple" },
    { icon: Factory, name: "Manufacturing", color: "orange" },
    { icon: Store, name: "Retail & Shopping", color: "pink" },
    { icon: Warehouse, name: "Warehouses & Logistics", color: "indigo" },
  ];

  // Features
  const features = [
    {
      icon: Eye,
      title: "Live Monitoring",
      description:
        "Real-time video surveillance accessible from any device, anywhere",
    },
    {
      icon: Bell,
      title: "Instant Alerts",
      description:
        "Get notified immediately about suspicious activities or security breaches",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description:
        "Bank-grade encryption and secure access controls for your organization",
    },
    {
      icon: Cloud,
      title: "Cloud Storage",
      description:
        "Secure cloud backup with easy retrieval and playback capabilities",
    },
    {
      icon: Users,
      title: "Role Management",
      description:
        "Customizable access levels for different user groups and departments",
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description:
        "Advanced analytics to identify patterns and improve security measures",
    },
  ];

  // Stats
  const stats = [
    { value: "10K+", label: "Organizations Trust Us" },
    { value: "50K+", label: "Cameras Installed" },
    { value: "99.9%", label: "Uptime Guaranteed" },
    { value: "24/7", label: "Support Available" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">
                SecureVision
              </span>
              <Badge
                variant="outline"
                className="ml-2 bg-blue-50 text-blue-700 border-blue-200"
              >
                Enterprise CCTV
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleAdminLogin}
                className="text-slate-600 hover:text-blue-600"
              >
                <Lock className="w-4 h-4 mr-2" />
                Admin
              </Button>
              <Button
                onClick={handleUserPortal}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                User Portal
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,black)]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Badge className="mb-6 px-4 py-2 bg-blue-50 text-blue-700 border-blue-200 text-sm">
              🏢 Enterprise-Grade Security Solution
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Complete Surveillance for
              <span className="text-blue-600 block mt-2">
                Your Organization
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Advanced CCTV monitoring, real-time alerts, and comprehensive
              security management for businesses, institutions, and facilities
              of all sizes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                onClick={handleUserPortal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
              >
                <Eye className="w-5 h-5 mr-2" />
                User Portal
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleAdminLogin}
                className="border-2 px-8 py-6 text-lg"
              >
                <Lock className="w-5 h-5 mr-2" />
                Admin Login
              </Button>
            </div>

            {/* Trusted By Section */}
            <div className="mt-12 pt-8 border-t border-slate-200">
              <p className="text-sm text-slate-500 mb-4">
                TRUSTED BY ORGANIZATIONS WORLDWIDE
              </p>
              <div className="flex flex-wrap justify-center gap-8 items-center">
                {industries.slice(0, 4).map((industry, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-slate-600"
                  >
                    <industry.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{industry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-on-scroll opacity-0">
            <Badge className="mb-4">Solutions For Every Industry</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              One Platform, Infinite Applications
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From schools to factories, we provide tailored surveillance
              solutions for your specific needs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {industries.map((industry, index) => (
              <div
                key={index}
                className="group text-center p-4 rounded-xl hover:bg-blue-50 transition-all duration-300 cursor-pointer animate-on-scroll opacity-0"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`w-14 h-14 bg-${industry.color}-50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}
                >
                  <industry.icon
                    className={`w-7 h-7 text-${industry.color}-600`}
                  />
                </div>
                <p className="text-sm font-medium text-slate-700">
                  {industry.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center text-white animate-on-scroll opacity-0"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  {stat.value}
                </div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50" ref={featuresRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll opacity-0">
            <Badge className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need for Complete Security
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Powerful features designed to protect your organization around the
              clock
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow animate-on-scroll opacity-0"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-on-scroll opacity-0">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Ready to Secure Your Organization?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Join thousands of organizations that trust us for their security
            needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleUserPortal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              Get Started Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-2">
              <Phone className="w-5 h-5 mr-2" />
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">SecureVision</span>
              </div>
              <p className="text-slate-400 text-sm">
                Enterprise surveillance solutions for organizations of all
                sizes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>Features</li>
                <li>Pricing</li>
                <li>Integrations</li>
                <li>Updates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>About Us</li>
                <li>Careers</li>
                <li>Blog</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Status</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400 text-sm">
            &copy; 2026 SecureVision. All rights reserved.
          </div>
        </div>
      </footer>
      <style jsx>{`
        .bg-grid-slate-100 {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23e2e8f0'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
        }
      `}</style>
    </div>
  );
}

// Import Phone icon
import { Phone } from "lucide-react";

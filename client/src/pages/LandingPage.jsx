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
  BarChart3
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
            entry.target.classList.add("animate-in", "fade-in", "slide-in-from-bottom-4");
            entry.target.classList.remove("opacity-0");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleAdminLogin = () => {
    navigate("/admin-login");
  };

  const handleParentPortal = () => {
    navigate("/parent-portal");
  };

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
              <span className="text-xl font-bold text-slate-900">SchoolSecure</span>
              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                CCTV Surveillance
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
                onClick={handleParentPortal}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                Parent Portal
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
              🏫 India's Most Trusted School CCTV System
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Keep Your School Safe with
              <span className="text-blue-600 block mt-2">Smart CCTV Surveillance</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Real-time monitoring, instant alerts, and complete peace of mind for parents, teachers, and administrators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                onClick={handleParentPortal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
              >
                <Eye className="w-5 h-5 mr-2" />
                Parent Portal
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
       
          </div>
        </div>
      </section>


      {/* How It Works */}
      {/* <section className="pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> */}
          {/* <div className="text-center mb-16 animate-on-scroll opacity-0">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Simple. Secure. Reliable.
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Get started with SchoolSecure in three easy steps
            </p>
          </div> */}

          {/* <div className="grid md:grid-cols-3 gap-8 relative"> */}
            {/* Connection Lines */}
            {/* <div className="hidden md:block absolute top-1/3 left-1/4 right-1/4 h-0.5 bg-blue-200 -translate-y-1/2"></div> */}
            
            {/* {[
              {
                step: "01",
                title: "Install Cameras",
                description: "We help you install high-quality IP cameras in key locations",
                icon: Video,
              },
              {
                step: "02",
                title: "Configure System",
                description: "Set up categories, assign access, and customize alerts",
                icon: Settings,
              },
              {
                step: "03",
                title: "Start Monitoring",
                description: "Parents and admins can now access live feeds securely",
                icon: Eye,
              },
            ].map((item, index) => (
              <div key={index} className="text-center relative animate-on-scroll opacity-0">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 relative z-10">
                  {item.step}
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <item.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              </div>
            ))} */}
          {/* </div>
        </div>
      </section> */}

    



  

      <style jsx>{`
        .bg-grid-slate-100 {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23e2e8f0'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
        }
      `}</style>
    </div>
  );
}

// Import Settings icon (add this at top with other imports)
import { Settings } from "lucide-react";
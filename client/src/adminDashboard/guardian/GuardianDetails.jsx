// pages/guardian/GuardianDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  User,
  ArrowLeft,
  Edit,
  Key,
  Shield,
  Clock,
  Smartphone,
  Download,
  Printer,
  Users,
  BookOpen,
  Award,
  TrendingUp,
} from "lucide-react";
import { showSuccessAlert, showErrorAlert } from "@/services/pop";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";


import api from "@/services/api";
import AddStudentModal from "./AddStudentModal";
import ResetPasswordModal from "./ResetPasswordModal";
// import GuardianStats from "@/components/guardian/GuardianStats";

const GuardianDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guardian, setGuardian] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch guardian details
  const fetchGuardianDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/guardians/${id}`);
      setGuardian(response.data.data);
      
      // Fetch students of this guardian
      const studentsResponse = await api.get(`/guardians/${id}/students`);
      setStudents(studentsResponse.data.data || []);
      
      // Calculate stats
      calculateStats(response.data.data, studentsResponse.data.data || []);
    } catch (error) {
      showErrorAlert("Error", "Failed to fetch guardian details");
      navigate("/dashboard/guardians");
    } finally {
      setLoading(false);
    }
  };

  // Calculate guardian stats
  const calculateStats = (guardianData, studentsData) => {
    const totalStudents = studentsData.length;
    const activeStudents = studentsData.filter(s => s.status === "active").length;
    const totalFees = studentsData.reduce((acc, s) => acc + (s.fees || 0), 0);
    const paidFees = studentsData.reduce((acc, s) => acc + (s.paidFees || 0), 0);
    
    setStats({
      totalStudents,
      activeStudents,
      totalFees,
      paidFees,
      pendingFees: totalFees - paidFees,
      paymentProgress: totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0,
      lastActive: guardianData.lastLoginAt || "Never",
      accountAge: calculateAccountAge(guardianData.createdAt),
    });
  };

  const calculateAccountAge = (createdAt) => {
    if (!createdAt) return "N/A";
    const days = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} years`;
  };

  useEffect(() => {
    if (id) {
      fetchGuardianDetails();
    }
  }, [id]);

  const handleAddStudent = async (studentData) => {
    try {
      await api.post(`/guardians/${id}/students`, studentData);
      showSuccessAlert("Success", "Student added successfully");
      setIsAddStudentModalOpen(false);
      fetchGuardianDetails(); // Refresh data
    } catch (error) {
      showErrorAlert("Error", error.response?.data?.message || "Failed to add student");
    }
  };

  const handleResetPassword = async (guardianId, newPassword) => {
    try {
      await api.post(`/guardians/${guardianId}/reset-password`, { password: newPassword });
      showSuccessAlert("Success", "Password reset successfully");
      setIsResetModalOpen(false);
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to reset password");
    }
  };

  const handleEditStudent = async (studentId, data) => {
    try {
      await api.put(`/students/${studentId}`, data);
      showSuccessAlert("Success", "Student updated successfully");
      fetchGuardianDetails();
    } catch (error) {
      showErrorAlert("Error", error.response?.data?.message || "Failed to update student");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      await api.delete(`/students/${studentId}`);
      showSuccessAlert("Success", "Student deleted successfully");
      fetchGuardianDetails();
    } catch (error) {
      showErrorAlert("Error", error.response?.data?.message || "Failed to delete student");
    }
  };

  if (loading) {
    return <GuardianDetailsSkeleton />;
  }

  if (!guardian) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <User className="w-16 h-16 text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700">Guardian not found</h3>
        <p className="text-sm text-slate-500 mb-4">The guardian you're looking for doesn't exist</p>
        <Button onClick={() => navigate("/dashboard/guardians")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Guardians
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      {/* Header with Back Button and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard/guardians")}
            className="h-10 w-10 rounded-full bg-white shadow-sm hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Guardian Profile</h1>
            <p className="text-sm text-slate-500">Manage guardian information and students</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="hidden sm:flex gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {/* Download PDF */}}
            className="hidden sm:flex gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/dashboard/guardians/edit/${id}`)}
            className="gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button
            size="sm"
            onClick={() => setIsResetModalOpen(true)}
            className="gap-2 bg-amber-600 hover:bg-amber-700"
          >
            <Key className="w-4 h-4" />
            Reset Password
          </Button>
        </div>
      </div>

      {/* Main Profile Card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <GuardianAvatar
                name={guardian.name || guardian.guardianName}
                photo={guardian.guardianPhoto}
                size="xl"
                className="border-4 border-white shadow-xl"
              />
              <Badge 
                className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold ${
                  guardian.status === 'active' 
                    ? 'bg-emerald-500' 
                    : guardian.status === 'locked'
                    ? 'bg-rose-500'
                    : 'bg-slate-500'
                }`}
              >
                {guardian.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-20 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {guardian.name || guardian.guardianName}
                </h2>
                <p className="text-slate-500 flex items-center gap-1 mt-1">
                  <Mail className="w-4 h-4" />
                  {guardian.email}
                </p>
                <p className="text-slate-500 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {guardian.mobile}
                </p>
              </div>

              <Separator />

              {/* Additional Info */}
              <div className="space-y-3">
                {guardian.occupation && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Occupation</p>
                      <p className="text-sm font-medium">{guardian.occupation}</p>
                    </div>
                  </div>
                )}

                {guardian.annualIncome && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Annual Income</p>
                      <p className="text-sm font-medium">₹{guardian.annualIncome.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {guardian.alternatePhone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Alternate Phone</p>
                      <p className="text-sm font-medium">{guardian.alternatePhone}</p>
                    </div>
                  </div>
                )}

                {guardian.address && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Address</p>
                      <p className="text-sm font-medium">{guardian.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Card className="p-3 bg-indigo-50 border-0">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs text-indigo-600">Students</span>
                  </div>
                  <p className="text-xl font-bold text-indigo-700 mt-1">{stats?.totalStudents || 0}</p>
                </Card>
                <Card className="p-3 bg-emerald-50 border-0">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs text-emerald-600">Active</span>
                  </div>
                  <p className="text-xl font-bold text-emerald-700 mt-1">{stats?.activeStudents || 0}</p>
                </Card>
              </div>
            </div>

            {/* Right Column - Stats and Activity */}
            <div className="lg:col-span-2 space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-500">Total Fees</p>
                    <DollarSign className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">₹{stats?.totalFees?.toLocaleString() || 0}</p>
                  <p className="text-xs text-slate-400 mt-1">Across all students</p>
                </Card>

                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-500">Paid Fees</p>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">₹{stats?.paidFees?.toLocaleString() || 0}</p>
                  <div className="mt-2">
                    <Progress value={stats?.paymentProgress || 0} className="h-1.5" />
                    <p className="text-xs text-slate-400 mt-1">{stats?.paymentProgress || 0}% paid</p>
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-500">Pending Fees</p>
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">₹{stats?.pendingFees?.toLocaleString() || 0}</p>
                  <p className="text-xs text-slate-400 mt-1">Due amount</p>
                </Card>
              </div>

              {/* Activity Timeline */}
              <Card className="p-4">
                <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-600">Last login:</span>
                    <span className="font-medium">{new Date(stats?.lastActive).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-slate-600">Account age:</span>
                    <span className="font-medium">{stats?.accountAge}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-slate-600">Total students:</span>
                    <span className="font-medium">{stats?.totalStudents}</span>
                  </div>
                </div>
              </Card>

              {/* Security Info */}
              <Card className="p-4 bg-slate-50 border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-sm font-medium">Account Security</p>
                      <p className="text-xs text-slate-500">2FA: {guardian.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                  </div>
                  <Badge variant={guardian.twoFactorEnabled ? "default" : "outline"}>
                    {guardian.twoFactorEnabled ? 'Secure' : 'Basic'}
                  </Badge>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="students" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white border p-1">
          <TabsTrigger value="students" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
            <Users className="w-4 h-4 mr-2" />
            Students ({students.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
            <DollarSign className="w-4 h-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
            <Clock className="w-4 h-4 mr-2" />
            Activity Log
          </TabsTrigger>
          <TabsTrigger value="devices" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
            <Smartphone className="w-4 h-4 mr-2" />
            Devices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          {/* Students Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Enrolled Students</h3>
              <p className="text-sm text-slate-500">Manage students under this guardian</p>
            </div>
            <Button 
              onClick={() => setIsAddStudentModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </div>

          {/* Students Table */}
          <StudentTable 
            students={students}
            onEdit={handleEditStudent}
            onDelete={handleDeleteStudent}
            guardianId={id}
          />
        </TabsContent>

        <TabsContent value="payments">
          <Card className="p-6">
            <p className="text-center text-slate-500">Payment history will be displayed here</p>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="p-6">
            <p className="text-center text-slate-500">Activity log will be displayed here</p>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card className="p-6">
            <p className="text-center text-slate-500">Device history will be displayed here</p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        onSubmit={handleAddStudent}
        guardianId={id}
      />

      <ResetPasswordModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        guardian={guardian}
        onReset={handleResetPassword}
      />
    </div>
  );
};

// Guardian Avatar Component
const GuardianAvatar = ({ name, photo, size = "md", className = "" }) => {
  const initials = name
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "G";

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-2xl",
  };

  const colors = [
    "bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700",
    "bg-gradient-to-br from-pink-100 to-pink-200 text-pink-700",
    "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700",
    "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700",
  ];

  const colorIndex = name
    ? name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    : 0;

  return (
    <Avatar className={`${sizeClasses[size]} ${className} ring-2 ring-white`}>
      {photo ? (
        <img src={photo} alt={name} className="object-cover" />
      ) : (
        <AvatarFallback className={colors[colorIndex]}>
          {initials}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

// Skeleton Loading Component
const GuardianDetailsSkeleton = () => (
  <div className="space-y-6 p-6">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>

    {/* Profile Card Skeleton */}
    <Card className="overflow-hidden">
      <Skeleton className="h-32 w-full" />
      <div className="p-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div>
                    <Skeleton className="h-3 w-20 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-2">
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
);

export default GuardianDetails;
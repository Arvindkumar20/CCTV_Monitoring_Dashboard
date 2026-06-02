// components/guardian/AddStudentModal.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Upload, X, Loader2, User, Phone, Mail, BookOpen, Users, Hash } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { showErrorAlert } from "@/services/pop";
import api from "@/services/api";


const AddStudentModal = ({ isOpen, onClose, onSubmit, guardianId }) => {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [groups, setGroups] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    dob: null,
    gender: "male",
    classId: "",
    sectionId: "",
    groupId: "",
    rollNumber: "",
    admissionNumber: "",
    mobile: "",
    email: "",
    address: "",
    bloodGroup: "",
    medicalNotes: "",
    status: "active",
  });

  // Fetch classes on mount
  useEffect(() => {
    if (isOpen) {
      fetchClasses();
    }
  }, [isOpen]);

  // Fetch sections when class changes
  useEffect(() => {
    if (formData.classId) {
      fetchSections(formData.classId);
    }
  }, [formData.classId]);

  // Fetch groups when section changes
  useEffect(() => {
    if (formData.sectionId) {
      fetchGroups(formData.sectionId);
    }
  }, [formData.sectionId]);

  const fetchClasses = async () => {
    try {
      const response = await api.get("/categories?type=class");
      setClasses(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  };

  const fetchSections = async (classId) => {
    try {
      const response = await api.get(`/subcategories?classId=${classId}`);
      setSections(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch sections:", error);
    }
  };

  const fetchGroups = async (sectionId) => {
    try {
      const response = await api.get(`/nested-subcategories?sectionId=${sectionId}`);
      setGroups(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Reset dependent fields
    if (name === "classId") {
      setFormData((prev) => ({ ...prev, sectionId: "", groupId: "" }));
      setSections([]);
      setGroups([]);
    }
    if (name === "sectionId") {
      setFormData((prev) => ({ ...prev, groupId: "" }));
      setGroups([]);
    }
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, dob: date }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name) {
      showErrorAlert("Validation Error", "Student name is required");
      return;
    }
    if (!formData.classId) {
      showErrorAlert("Validation Error", "Please select a class");
      return;
    }

    setLoading(true);
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== "") {
          if (key === "dob" && formData[key]) {
            submitData.append(key, format(formData[key], "yyyy-MM-dd"));
          } else {
            submitData.append(key, formData[key]);
          }
        }
      });
      
      // Append photo if selected
      if (photoFile) {
        submitData.append("photo", photoFile);
      }
      
      // Append guardianId
      submitData.append("guardianId", guardianId);
      
      await onSubmit(submitData);
      
      // Reset form
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to add student:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      dob: null,
      gender: "male",
      classId: "",
      sectionId: "",
      groupId: "",
      rollNumber: "",
      admissionNumber: "",
      mobile: "",
      email: "",
      address: "",
      bloodGroup: "",
      medicalNotes: "",
      status: "active",
    });
    setPhotoPreview(null);
    setPhotoFile(null);
    setSections([]);
    setGroups([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="w-5 h-5" />
            Add New Student
          </DialogTitle>
          <DialogDescription>
            Fill in the student details below. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="flex items-center gap-6">
            <div className="relative">
              {photoPreview ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-200">
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="photo" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Upload Photo</span>
                </div>
              </Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <p className="text-xs text-slate-500 mt-1">
                JPG, PNG or GIF (Max. 2MB)
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 border-b pb-2">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-1">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter student's full name"
                  required
                />
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dob && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dob ? format(formData.dob, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dob}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Blood Group */}
              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select
                  value={formData.bloodGroup}
                  onValueChange={(value) => handleSelectChange("bloodGroup", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                      <SelectItem key={bg} value={bg}>
                        {bg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 border-b pb-2">Academic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Class */}
              <div className="space-y-2">
                <Label htmlFor="classId" className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Class <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.classId}
                  onValueChange={(value) => handleSelectChange("classId", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls._id} value={cls._id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Section */}
              <div className="space-y-2">
                <Label htmlFor="sectionId" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Section
                </Label>
                <Select
                  value={formData.sectionId}
                  onValueChange={(value) => handleSelectChange("sectionId", value)}
                  disabled={!formData.classId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((sec) => (
                      <SelectItem key={sec._id} value={sec._id}>
                        {sec.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Group */}
              <div className="space-y-2">
                <Label htmlFor="groupId">Group</Label>
                <Select
                  value={formData.groupId}
                  onValueChange={(value) => handleSelectChange("groupId", value)}
                  disabled={!formData.sectionId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((grp) => (
                      <SelectItem key={grp._id} value={grp._id}>
                        {grp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Roll Number */}
              <div className="space-y-2">
                <Label htmlFor="rollNumber" className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  Roll Number
                </Label>
                <Input
                  id="rollNumber"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleInputChange}
                  placeholder="Enter roll number"
                />
              </div>

              {/* Admission Number */}
              <div className="space-y-2">
                <Label htmlFor="admissionNumber">Admission Number</Label>
                <Input
                  id="admissionNumber"
                  name="admissionNumber"
                  value={formData.admissionNumber}
                  onChange={handleInputChange}
                  placeholder="Enter admission number"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 border-b pb-2">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mobile */}
              <div className="space-y-2">
                <Label htmlFor="mobile" className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  Mobile Number
                </Label>
                <Input
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="Enter mobile number"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                />
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter full address"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 border-b pb-2">Medical Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="medicalNotes">Medical Notes (Allergies, Conditions, etc.)</Label>
              <Textarea
                id="medicalNotes"
                name="medicalNotes"
                value={formData.medicalNotes}
                onChange={handleInputChange}
                placeholder="Enter any medical conditions, allergies, or special notes"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Student
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentModal;
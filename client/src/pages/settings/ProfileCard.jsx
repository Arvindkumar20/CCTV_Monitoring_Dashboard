// pages/settings/ProfileCard.jsx
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const ProfileCard = ({ data = {}, onChange, user }) => {
  const [profile, setProfile] = useState({
    fullName: data.fullName || user?.name || "",
    email: data.email || user?.email || "",
    phone: data.phone || "",
    position: data.position || "",
    department: data.department || "",
    bio: data.bio || "",
    avatar: data.avatar || "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    onChange(field, value);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Profile Settings
          </span>
          <Badge variant="outline" className="text-xs">
            {user?.role || "User"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Manage your personal profile information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                {getInitials(profile.fullName)}
              </AvatarFallback>
            </Avatar>
            <button 
              className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1.5 hover:bg-blue-700 transition shadow-lg"
              onClick={() => document.getElementById('avatar-upload').click()}
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    handleChange("avatar", reader.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{profile.fullName || "Your Name"}</h3>
            <p className="text-sm text-gray-500">{profile.position || "Position not set"}</p>
            <p className="text-sm text-gray-500">{profile.department || "Department not set"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              Full Name
            </Label>
            <Input
              id="fullName"
              value={profile.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              Phone
            </Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-500" />
              Position
            </Label>
            <Input
              id="position"
              value={profile.position}
              onChange={(e) => handleChange("position", e.target.value)}
              placeholder="Enter your position"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              Department
            </Label>
            <Input
              id="department"
              value={profile.department}
              onChange={(e) => handleChange("department", e.target.value)}
              placeholder="Enter your department"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="joinDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              Join Date
            </Label>
            <Input
              id="joinDate"
              type="date"
              value={data.joinDate || ""}
              onChange={(e) => handleChange("joinDate", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            placeholder="Tell us about yourself"
            className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </CardContent>
    </Card>
  );
};
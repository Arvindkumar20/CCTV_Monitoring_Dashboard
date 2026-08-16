// pages/settings/BrandingCard.jsx
import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Image, Upload, X, Palette, Check } from "lucide-react";
import { ColorPicker } from "@/components/ui/color-picker";

export const BrandingCard = ({ data = {}, onChange }) => {
  const [branding, setBranding] = useState({
    logo: data.logo || "",
    favicon: data.favicon || "",
    primaryColor: data.primaryColor || "#2563eb",
    secondaryColor: data.secondaryColor || "#7c3aed",
    accentColor: data.accentColor || "#06b6d4",
  });
  const [previewLogo, setPreviewLogo] = useState(data.logo || "");
  const [previewFavicon, setPreviewFavicon] = useState(data.favicon || "");
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPreviewLogo(base64String);
        setBranding(prev => ({ ...prev, logo: base64String }));
        onChange("logo", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPreviewFavicon(base64String);
        setBranding(prev => ({ ...prev, favicon: base64String }));
        onChange("favicon", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (field, value) => {
    setBranding(prev => ({ ...prev, [field]: value }));
    onChange(field, value);
  };

  const removeLogo = () => {
    setPreviewLogo("");
    setBranding(prev => ({ ...prev, logo: "" }));
    onChange("logo", "");
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const removeFavicon = () => {
    setPreviewFavicon("");
    setBranding(prev => ({ ...prev, favicon: "" }));
    onChange("favicon", "");
    if (faviconInputRef.current) faviconInputRef.current.value = "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-blue-600" />
          Branding & Appearance
        </CardTitle>
        <CardDescription>
          Customize your brand identity with logos and colors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Upload */}
        <div className="space-y-3">
          <Label> Logo</Label>
          <div className="flex items-start gap-4">
            <div className="relative">
              {previewLogo ? (
                <div className="relative group">
                  <img
                    src={previewLogo}
                    alt=" Logo"
                    className="w-32 h-32 object-contain border-2 border-gray-200 rounded-lg p-2"
                  />
                  <button
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <Image className="w-10 h-10 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-500">
                Recommended: PNG or SVG, max 2MB. Square aspect ratio.
              </p>
            </div>
          </div>
        </div>

        {/* Favicon Upload */}
        <div className="space-y-3">
          <Label>Favicon</Label>
          <div className="flex items-start gap-4">
            <div className="relative">
              {previewFavicon ? (
                <div className="relative group">
                  <img
                    src={previewFavicon}
                    alt="Favicon"
                    className="w-16 h-16 object-contain border-2 border-gray-200 rounded-lg p-1"
                  />
                  <button
                    onClick={removeFavicon}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <Image className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Input
                ref={faviconInputRef}
                type="file"
                accept="image/*"
                onChange={handleFaviconUpload}
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-500">
                Recommended: 16x16 or 32x32 pixels, ICO or PNG format.
              </p>
            </div>
          </div>
        </div>

        {/* Color Scheme */}
        <div className="space-y-4">
          <Label>Color Scheme</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Primary Color</Label>
              <div className="flex items-center gap-3">
                <ColorPicker
                  color={branding.primaryColor}
                  onChange={(color) => handleColorChange("primaryColor", color)}
                />
                <Input
                  value={branding.primaryColor}
                  onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                  className="w-24 font-mono text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Secondary Color</Label>
              <div className="flex items-center gap-3">
                <ColorPicker
                  color={branding.secondaryColor}
                  onChange={(color) => handleColorChange("secondaryColor", color)}
                />
                <Input
                  value={branding.secondaryColor}
                  onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                  className="w-24 font-mono text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Accent Color</Label>
              <div className="flex items-center gap-3">
                <ColorPicker
                  color={branding.accentColor}
                  onChange={(color) => handleColorChange("accentColor", color)}
                />
                <Input
                  value={branding.accentColor}
                  onChange={(e) => handleColorChange("accentColor", e.target.value)}
                  className="w-24 font-mono text-sm"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-full border-2 border-gray-300" 
                style={{ backgroundColor: branding.primaryColor }}
              />
              <span className="text-sm text-gray-600">Preview</span>
            </div>
            <div className="flex-1 h-2 rounded-full" style={{ 
              background: `linear-gradient(to right, ${branding.primaryColor}, ${branding.secondaryColor})` 
            }} />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Preview</span>
              <div 
                className="w-8 h-8 rounded-full border-2 border-gray-300" 
                style={{ backgroundColor: branding.accentColor }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
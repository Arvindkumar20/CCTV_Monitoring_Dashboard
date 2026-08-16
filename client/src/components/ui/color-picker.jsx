// components/ui/color-picker.jsx
import React, { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";

export const ColorPicker = ({ color, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const presetColors = [
    "#2563eb", "#7c3aed", "#06b6d4", "#10b981", 
    "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6"
  ];

  return (
    <div className="relative" ref={pickerRef}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-shadow shadow-sm hover:shadow-md"
          style={{ backgroundColor: color }}
        />
      </div>
      
      {isOpen && (
        <div className="absolute top-12 left-0 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[200px]">
          <HexColorPicker color={color} onChange={onChange} />
          <div className="flex flex-wrap gap-1 mt-3">
            {presetColors.map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  onChange(preset);
                  setIsOpen(false);
                }}
                className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform"
                style={{ backgroundColor: preset }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
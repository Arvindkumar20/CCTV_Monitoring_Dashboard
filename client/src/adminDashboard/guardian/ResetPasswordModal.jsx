// components/guardian/ResetPasswordModal.jsx
import React, { useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, Loader2, Eye, EyeOff, RefreshCw } from "lucide-react";
import { showErrorAlert, showSuccessAlert } from "@/services/pop";

const ResetPasswordModal = ({ isOpen, onClose, guardian, onReset }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [autoGenerate, setAutoGenerate] = useState(false);

  // Generate password from guardian name and mobile
  const generatePassword = () => {
    if (guardian?.name && guardian?.mobile) {
      const first3 = guardian.name.substring(0, 3).toLowerCase();
      const mobileStr = String(guardian.mobile).replace(/\D/g, "");
      const last4Digits = mobileStr.slice(-4);

      if (last4Digits.length === 4) {
        const generatedPass =
          first3.charAt(0).toUpperCase() + first3.slice(1) + last4Digits;
        setPassword(generatedPass);
        setConfirmPassword(generatedPass);
        setAutoGenerate(true);
      } else {
        showErrorAlert("Error", "Invalid mobile number format", "destructive");
      }
    } else {
      showErrorAlert("Error", "Invalid mobile number format", "destructive");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await onReset(guardian._id, password);

      showSuccessAlert(
        "Success",
        autoGenerate
          ? "Password reset successfully with auto-generated password"
          : "Password reset successfully",
      );

      // Reset form
      setPassword("");
      setConfirmPassword("");
      setAutoGenerate(false);
      onClose();
    } catch (error) {
      setError(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setConfirmPassword("");
    setError("");
    setAutoGenerate(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Reset Password - {guardian?.name}
          </DialogTitle>
          <DialogDescription>
            Enter a new password for this guardian. Click on generate to
            auto-create a password.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Auto-generate button */}
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generatePassword}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Auto-generate Password
            </Button>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Auto-generated info */}
          {autoGenerate && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-700 text-sm">
                Password auto-generated from guardian's name and mobile number
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Reset Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordModal;

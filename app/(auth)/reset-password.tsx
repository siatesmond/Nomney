import { useState } from "react";
import { Text, Alert } from "react-native";
import { Screen } from "../../components/ui/Screen";
import { router, useLocalSearchParams } from "expo-router";
import { InputWithIcon } from "../../components/ui/InputWithIcon";
import { Button } from "../../components/ui/BlackButton";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";

export default function ResetPassword() {
  // Get email passed from forgot-password
  const { email } = useLocalSearchParams<{ email: string }>();

  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Password validation (min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 symbol)
  const isValidPassword = (password: string) => {
    return (
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*()_+\-=\[\]{};':"\\|<>?,.\\/`~]/.test(password) // supabase allowed symbols
    );
  };

  const handleVerifyAndReset = async () => {
    setOtpError("");
    setPasswordError("");

    if (!otpCode) {
      setOtpError("OTP Code is required");
      return;
    }
    if (!newPassword) {
      setPasswordError("Password is required");
      return;
    }
    if (!isValidPassword(newPassword)) {
      setPasswordError(
        "Password must have at least 8 characters with uppercase, lowercase, digits and a symbol",
      );
      return;
    }

    try {
      setLoading(true);

      // Verify OTP using the email passed via navigation params
      const { error } = await supabase.auth.verifyOtp({
        email: email || "",
        token: otpCode,
        type: "recovery",
      });

      if (error) {
        console.error("Verify code error:", error);
        setOtpError(
          error.message || "Invalid or expired code. Please try again.",
        );
        return;
      }

      // Update new password after OTP is verified
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error("Update password error:", updateError);
        setPasswordError(
          updateError.message || "An error occurred. Please try again.",
        );
        return;
      }

      // Clear session and Log out
      await supabase.auth.signOut();

      // Navigate to Password Reset success page
      router.replace("/password-success");
    } catch (err) {
      console.error("Error:", err);
      setOtpError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset Password Form
  return (
    <Screen>
      <Text className="text-3xl font-bold mb-4">Enter your code</Text>
      <Text className="text-[#707070] text-sm mb-8">
        We've sent a 6-digit code to {email}. Enter it below along with your new
        password.
      </Text>

      <InputWithIcon
        icon={<Ionicons name="key-outline" size={20} color="#838383" />}
        placeholder="6-digit code"
        value={otpCode}
        onChangeText={(text) => {
          setOtpCode(text);
          setOtpError("");
        }}
        keyboardType="number-pad"
      />

      {/* Invalid OTP Error */}
      {otpError ? (
        <Text
          style={{
            backgroundColor: "#FEE2E2",
            color: "#B91C1C",
            padding: 10,
            borderRadius: 8,
            marginTop: 14,
            textAlign: "center",
            fontSize: 13,
          }}
        >
          {otpError}
        </Text>
      ) : null}

      {/* New Password Input */}
      <InputWithIcon
        icon={<Ionicons name="lock-closed-outline" size={20} color="#838383" />}
        placeholder="New password"
        value={newPassword}
        onChangeText={(text) => {
          setNewPassword(text);
          setPasswordError("");
        }}
        autoCapitalize="none"
        secureTextEntry={!showPassword}
        rightIcon={
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={20}
            color="#838383"
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />

      {passwordError ? (
        <Text
          style={{
            backgroundColor: "#FEE2E2",
            color: "#B91C1C",
            padding: 10,
            borderRadius: 8,
            marginTop: 14,
            textAlign: "center",
            fontSize: 13,
          }}
        >
          {passwordError}
        </Text>
      ) : null}

      {/* Reset Password Button*/}
      <Button
        title={loading ? "Updating..." : "Reset password"}
        onPress={handleVerifyAndReset}
        disabled={loading}
      />
    </Screen>
  );
}

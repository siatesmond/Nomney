import { useState } from "react";
import { Text, View, Pressable } from "react-native";
import { Screen } from "../../components/ui/Screen";
import { router, Link } from "expo-router";
import { InputWithIcon } from "../../components/ui/InputWithIcon";
import { Button } from "../../components/ui/BlackButton";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";

export default function ForgotPassword() {
  const [step, setStep] = useState<"email" | "code">("email");

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Basic format Email check
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  };

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

  // Request OTP code
  const handleSendOTP = async () => {
    setEmailError("");

    if (!email) {
      setEmailError("Email is required");
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      // Send email with OTP code
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        console.error("Send code error:", error);
        setEmailError(error.message || "An error occurred. Please try again.");
        return;
      }

      // Navigate to Verify OTP and Reset Password page
      router.push({
        pathname: "/reset-password",
        params: { email: email },
      });
    } catch (err) {
      console.error("Error:", err);
      setEmailError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text className="text-3xl font-bold mb-4">Forgot password</Text>
      <Text className="text-[#707070] text-sm mb-8">
        Enter your email and we'll send you a code to reset your password.
      </Text>

      {/* Email Input */}
      <InputWithIcon
        icon={<Ionicons name="mail-outline" size={20} color="#838383" />}
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setEmailError("");
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Invalid Email error */}
      {emailError ? (
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
          {emailError}
        </Text>
      ) : null}

      {/* Send OTP Button */}
      <Button
        title={loading ? "Sending..." : "Send code"}
        onPress={handleSendOTP}
        disabled={loading}
      />

      {/* Register link */}
      <Link href="/login" asChild>
        <Text className="text-[#707070] font-medium text-center mt-6">
          {/* Nesting the icon inline inside the Text component */}
          <Ionicons name="arrow-back-outline" size={16} color="#707070" /> Back
          to Login
        </Text>
      </Link>
    </Screen>
  );
}

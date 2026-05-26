import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import { Button } from "../../components/styles/BlackButton";
import { InputWithIcon } from "../../components/styles/InputWithIcon";
import { Screen } from "../../components/styles/Screen";
import { supabase } from "../../lib/supabase";

export default function Login() {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Error state
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");

  // Show/Hide password toggle
  const [showPassword, setShowPassword] = useState(false);

  // Basic format Email check
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  };

  // Checks email while typing
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!email) {
        setEmailError("");
        return;
      }

      if (!isValidEmail(email)) {
        setEmailError("Invalid email format");
      } else {
        setEmailError("");
      }
    }, 300); // wait 300ms after typing stops

    return () => clearTimeout(timeout);
  }, [email]);

  // Login
  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");
    setFormError("");

    // Validation - empty fields
    if (!email) {
      setEmailError("Email is required");
      return;
    }
    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    // Validation - email format
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      // Supabase auth req
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setFormError("Incorrect email or password. Please try again.");
        return;
      }
      // Login success
      router.replace("/home");
    } finally {
      setLoading(false);
    }
  };

  // Display error based on priority (One error at a time)
  const visibleError =
    formError ||
    (!email
      ? emailError
      : !password
        ? passwordError
        : emailError || passwordError);

  return (
    <Screen>
      <Text className="text-3xl font-bold mb-8">Login</Text>

      {/* Email Input */}
      <InputWithIcon
        icon={<Ionicons name="mail-outline" size={20} color="#838383" />}
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);

          setFormError("");
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input */}
      <InputWithIcon
        icon={<Ionicons name="lock-closed-outline" size={20} color="#838383" />}
        placeholder="Password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setPasswordError("");
          setFormError("");
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

      {/* Forgot password */}
      <Link href="/" className="text-[#707070] font-medium">
        Forgot password?
      </Link>

      {/* Error Box */}
      {visibleError ? (
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
          {visibleError}
        </Text>
      ) : null}

      {/* Submit Button */}
      <Button
        title={loading ? "Signing in..." : "Sign in"}
        onPress={handleLogin}
        disabled={loading}
      />

     {/* Register link */}
      <Text className="text-[#707070] font-medium text-center mt-6">
        New here?{" "}
        <Link href="/register" asChild>
          <Text className="text-[#707070] font-medium underline">
            Create an account
          </Text>
        </Link>
      </Text>
    </Screen>
  );
}

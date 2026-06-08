import { useState, useEffect } from "react";
import { Text } from "react-native";
import { Screen } from "../../components/styles/Screen";
import { InputWithIcon } from "../../components/styles/InputWithIcon";
import { Button } from "../../components/styles/BlackButton";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";

export default function Register() {
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // Error state
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [formError, setFormError] = useState("");

  // Show/Hide password toggle
  const [showPassword, setShowPassword] = useState(false);

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

  // Checks password while typing
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!password) {
        setPasswordError("");
        return;
      }

      if (!isValidPassword(password)) {
        setPasswordError(
          "Password must have at least 8 characters with uppercase, lowercase, digits and a symbol",
        );
      } else {
        setPasswordError("");
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [password]);

  // Register
  const handleRegister = async () => {
    setFirstNameError("");
    setLastNameError("");
    setUsernameError("");
    setEmailError("");
    setPasswordError("");
    setFormError("");

    // Validation - empty fields
    if (!firstName) {
      setFirstNameError("First name is required");
      return;
    }
    if (!lastName) {
      setLastNameError("Last name is required");
      return;
    }
    if (!username) {
      setUsernameError("Username is required");
      return;
    }
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

    // Validation - password strength
    if (!isValidPassword(password)) {
      setPasswordError(
        "Password must have at least 8 characters with uppercase, lowercase, digits and a symbol",
      );
      return;
    }

    try {
      setLoading(true);

      // Sign up user - trigger will automatically create profile
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            username: username,
          },
        },
      });

      if (error) {
        console.error("Auth error:", error);

        let userMessage = "Sign up failed. Please try again.";

        switch (error.code) {
          case "user_already_exists":
            userMessage =
              "This email is already registered. Please log in instead.";
            break;
          case "weak_password":
            userMessage = "Password doesn't meet security requirements.";
            break;
          default:
            userMessage = error.message || "Sign up failed. Please try again.";
        }

        setFormError(userMessage);
        return;
      }

      console.log("Sign up successful:", data);
      // Register success
      router.replace("/home");
    } catch (err) {
      console.error("Unexpected error:", err);
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Display error based on priority (One error at a time)
  const visibleError =
    formError ||
    firstNameError ||
    lastNameError ||
    usernameError ||
    emailError ||
    passwordError;

  return (
    <Screen>
      <Text className="text-3xl font-bold mb-8">Sign up</Text>

      {/* First Name Input */}
      <InputWithIcon
        icon={<Ionicons name="person-outline" size={20} color="#838383" />}
        placeholder="First Name"
        value={firstName}
        onChangeText={(text) => {
          setFirstName(text);
          setFirstNameError("");
          setFormError("");
        }}
        autoCapitalize="none"
      />

      {/* Last Name Input */}
      <InputWithIcon
        icon={<Ionicons name="person-outline" size={20} color="#838383" />}
        placeholder="Last Name"
        value={lastName}
        onChangeText={(text) => {
          setLastName(text);
          setLastNameError("");
          setFormError("");
        }}
        autoCapitalize="none"
      />

      {/* Username Input */}
      <InputWithIcon
        icon={<Ionicons name="person-outline" size={20} color="#838383" />}
        placeholder="Username"
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          setUsernameError("");
          setFormError("");
        }}
        autoCapitalize="none"
      />

      {/* Email Input */}
      <InputWithIcon
        icon={<Ionicons name="mail-outline" size={20} color="#838383" />}
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setEmailError("");
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

      <Button
        title={loading ? "Creating..." : "Create account"}
        onPress={handleRegister}
        disabled={loading}
      />

      <Text className="text-[#707070] font-medium text-center mt-6">
        Have an account?{" "}
        <Link href="/login" asChild>
          <Text className="text-[#707070] font-medium underline">Log in</Text>
        </Link>
      </Text>
    </Screen>
  );
}

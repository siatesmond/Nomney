import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
import { Alert, Text } from "react-native";
import { Button } from "../../components/styles/BlackButton";
import { InputWithIcon } from "../../components/styles/InputWithIcon";
import { Screen } from "../../components/styles/Screen";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        Alert.alert("Login failed", error.message);
        return;
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text className="text-3xl font-bold mb-8">Login</Text>
      <InputWithIcon
        icon={<Ionicons name="mail-outline" size={20} color="#838383" />}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <InputWithIcon
        icon={<Ionicons name="lock-closed-outline" size={20} color="#838383" />}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        secureTextEntry
      />

      <Link href="/" className="text-[#707070] font-medium">
        Forgot password?
      </Link>

      <Button
        title={loading ? "Signing in..." : "Sign in"}
        onPress={handleLogin}
        disabled={loading}
      />
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

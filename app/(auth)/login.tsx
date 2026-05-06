import { useState } from "react";
import { Text } from "react-native";
import { Screen } from "../../components/styles/Screen";
import { InputWithIcon } from "../../components/styles/InputWithIcon";
import { Button } from "../../components/styles/BlackButton";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        value={email}
        onChangeText={setPassword}
        autoCapitalize="none"
        secureTextEntry
      />

      <Link href="/" className="text-[#707070] font-medium">
        Forgot password?
      </Link>

      <Button title="Sign In" />

      <Link href="/" className="text-[#707070] font-medium text-center mt-6">
        New here? Create an account
      </Link>
    </Screen>
  );
}

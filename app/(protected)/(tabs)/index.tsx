import { Link } from "expo-router";
import { View } from "react-native";

export default function HomeScreen() {
  return (
    <View>
      <Link href="/login">Login</Link>
       <Link href="/register">Register</Link>
    </View>
  );
}
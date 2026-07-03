import { Text } from "react-native";
import { Screen } from "../../components/ui/Screen";
import { router } from "expo-router";
import { Button } from "../../components/ui/BlackButton";
import { Ionicons } from "@expo/vector-icons";


export default function PasswordSuccess() {
  return (
    <Screen>
      <Ionicons 
        name="checkmark-circle-outline" 
        size={80} 
        color="#FA5A40" 
        style={{ alignSelf: "center", marginBottom: 20, marginTop: 40 }} 
      />
      
      <Text className="text-3xl font-bold mb-4 text-center">Password updated</Text>
      
      <Text className="text-[#707070] text-sm mb-8 text-center px-4">
        Your password has been successfully reset. You can now log in with your new password.
      </Text>
      
      <Button
        title="Login"
        onPress={() => router.replace("/login")}
      />
    </Screen>
  );
}
import { View, Text, Button } from "react-native";
import React, { useEffect } from "react";
import { supabase } from "@/src/lib/supabase";
import { useAuth } from "@/src/providers/AuthProvider";

const ProfileScreen = () => {
  const { profile } = useAuth();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 20,
          marginBottom: 20,
        }}
      >
        {profile !== null && profile.id}
      </Text>

      <Button
        title="Sign Out"
        onPress={async () => await supabase.auth.signOut()}
      />
    </View>
  );
};

export default ProfileScreen;

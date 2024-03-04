import { View, Text, Platform, FlatList } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { useCart } from "../providers/CartProvider";
import CartListItem from "../components/CartListItem";
import Button from "../components/Button";

const cartScreen = () => {
  const { items, total } = useCart();
  return (
    <View style={{ padding: 10 }}>
      <FlatList
        data={items}
        renderItem={({ item }) => <CartListItem cartItem={item} />}
        contentContainerStyle={{ gap: 10 }}
      />

      <Text style={{ marginTop: 10, fontSize: 20, fontWeight: "500" }}>
        Total: {total}
      </Text>

      <Button text="Check Out" />

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
};

export default cartScreen;

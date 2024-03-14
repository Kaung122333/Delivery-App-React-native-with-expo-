import { uesUpdateOrder, useOrderDetails } from "@/src/api/orders";
import OrderItemListItem from "@/src/components/OrderItemListItem";
import OrderListItem from "@/src/components/OrderListItem";
import Colors from "@/src/constants/Colors";
import { notifyUserAboutOrderUpdate } from "@/src/lib/notifications";
import { OrderStatusList } from "@/src/types";
import { Stack, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

export default function OrderDetailsScreen() {
  const { id: idString } = useLocalSearchParams();
  const id = parseFloat(typeof idString === "string" ? idString : idString[0]);

  const { data: order, isLoading, error } = useOrderDetails(id);
  const { mutateAsync: updatedOrder } = uesUpdateOrder();

  const updateStatus = async (status: string) => {
    await updatedOrder({ id: id, updatedField: { status } });
    if (order) {
      await notifyUserAboutOrderUpdate({ ...order, status });
    }
  };

  if (isLoading) {
    return <ActivityIndicator />;
  }
  if (error || !order) {
    return <Text>Failed to fetch</Text>;
  }

  return (
    <View style={{ padding: 10, gap: 20 }}>
      <Stack.Screen options={{ title: `Order #${id} ` }} />

      <OrderListItem order={order} />

      <FlatList
        data={order.order_item}
        renderItem={({ item }) => {
          // Console log the 'item' here

          return <OrderItemListItem item={item} />;
        }}
        contentContainerStyle={{ gap: 10 }}
        ListFooterComponent={() => (
          <>
            <Text style={{ fontWeight: "bold" }}>Status</Text>
            <View style={{ flexDirection: "row", gap: 5 }}>
              {OrderStatusList.map((status) => (
                <Pressable
                  key={status}
                  onPress={() => updateStatus(status)}
                  style={{
                    borderColor: Colors.light.tint,
                    borderWidth: 1,
                    padding: 10,
                    borderRadius: 5,
                    marginVertical: 10,
                    backgroundColor:
                      order.status === status
                        ? Colors.light.tint
                        : "transparent",
                  }}
                >
                  <Text
                    style={{
                      color:
                        order.status === status ? "white" : Colors.light.tint,
                    }}
                  >
                    {status}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      />
    </View>
  );
}

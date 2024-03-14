import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import Button from "@/src/components/Button";
import { defaultPizzaImage } from "@/src/components/ProductListItem";
import Colors from "@/src/constants/Colors";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  uesUpdateProduct,
  useDeleteProduct,
  useInsertProduct,
  useProduct,
} from "@/src/api/products";
import * as FileSystem from "expo-file-system";
import { randomUUID } from "expo-crypto";
import { supabase } from "@/src/lib/supabase";
import { decode } from "base64-arraybuffer";

const CreateProductScreen = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDLoading, setIsDLoading] = useState(false);

  const router = useRouter();

  const { id: idString } = useLocalSearchParams();
  const id = parseFloat(
    typeof idString === "string" ? idString : idString?.[0]
  );

  const isUpdating = !!id;

  const { mutateAsync: insertProduct } = useInsertProduct();
  const { mutateAsync: updateProduct } = uesUpdateProduct();
  const { mutateAsync: deleteProduct } = useDeleteProduct();
  const { data: updatingProduct } = useProduct(id);

  useEffect(() => {
    if (updatingProduct) {
      setName(updatingProduct.name);
      setPrice(updatingProduct.price.toString());
      setImage(updatingProduct.image);
    }
  }, [updatingProduct]);

  const resetFields = () => {
    setName("");
    setPrice("");
  };

  const validateInput = () => {
    if (!name) {
      setError("Name is required");
      return false;
    }
    if (!price) {
      setError("Price is required");
      return false;
    }
    if (isNaN(parseFloat(price))) {
      setError("Price is not a number");
      return false;
    }
    return true;
  };

  const onSubmit = () => {
    if (isUpdating) {
      //update
      onUpdate();
    } else {
      onCreate();
    }
  };

  const onCreate = async () => {
    setError("");
    if (!validateInput()) {
      return;
    }
    setIsLoading(true);

    const imagePath = await uploadImage();

    //save in the database
    await insertProduct(
      { name, price: parseFloat(price), image: imagePath },
      {
        onSuccess(data, variables, context) {
          resetFields();
          router.back();
        },
      }
    );
    setIsLoading(false);
  };

  const onUpdate = async () => {
    setError("");
    setIsLoading(true);
    if (!validateInput()) {
      return;
    }

    const imagePath = await uploadImage();

    //save in the database
    await updateProduct(
      {
        id,
        name,
        price: parseFloat(price),
        image: imagePath,
      },
      {
        onSuccess: () => {
          resetFields();
          router.back();
        },
      }
    );

    setIsLoading(false);
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const onDelete = async () => {
    setIsDLoading(true);

    await deleteProduct(id, {
      onSuccess(data, variables, context) {
        router.replace("/(admin)");
      },
    });
    setIsDLoading(false);
  };

  const confirmDelete = () => {
    Alert.alert("Confirm", "Are you sure want to delete this product?", [
      {
        text: "Cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: onDelete,
      },
    ]);
  };

  const uploadImage = async () => {
    if (!image?.startsWith("file://")) {
      return;
    }

    const base64 = await FileSystem.readAsStringAsync(image, {
      encoding: "base64",
    });
    const filePath = `${randomUUID()}.png`;
    const contentType = "image/png";
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(filePath, decode(base64), { contentType });

    console.log(error);
    if (data) {
      return data.path;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ title: isUpdating ? "Update Product" : "Create Product" }}
      />
      <Image
        style={styles.image}
        source={{ uri: image || defaultPizzaImage }}
      />
      <Text onPress={pickImage} style={styles.textButton}>
        Select Image
      </Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        keyboardType="default"
        placeholder="Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Price ($)</Text>
      <TextInput
        keyboardType="numeric"
        placeholder="9.99"
        style={styles.input}
        value={price}
        onChangeText={setPrice}
      />

      <Text style={{ color: "red" }}>{error}</Text>
      <Button
        onPress={onSubmit}
        text={
          isLoading
            ? isUpdating
              ? "Updating"
              : "Creating"
            : isUpdating
            ? "Update"
            : "Create"
        }
        disabled={isLoading}
      />
      {isUpdating && (
        <Text onPress={confirmDelete} style={styles.textButton}>
          {isDLoading ? "Deleting.." : "Delete"}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 10,
  },
  image: {
    width: "50%",
    aspectRatio: 1,
    alignSelf: "center",
  },
  textButton: {
    alignSelf: "center",
    fontWeight: "bold",
    color: Colors.light.tint,
    marginVertical: 10,
  },
  input: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 20,
  },
  label: {
    color: "gray",
    fontSize: 16,
  },
});

export default CreateProductScreen;

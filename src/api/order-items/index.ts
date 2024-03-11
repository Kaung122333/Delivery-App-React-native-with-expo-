import { supabase } from "@/src/lib/supabase";
import { InsertTable } from "./../../types";
import { useMutation } from "@tanstack/react-query";

export const useInsertOrderItems = () => {
  return useMutation({
    async mutationFn(items: InsertTable<"order_item">[]) {
      const { data: newProduct, error } = await supabase
        .from("order_item")
        .insert(items)
        .select();

      if (error) {
        throw new Error(error.message);
      }

      return newProduct;
    },
  });
};

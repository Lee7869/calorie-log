import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
// 一筆餐點長這樣
type Meal = { id: string; name: string; kcal: number; protein: number };

export default function Index() {
  const goal = 2000;

  // useState：會變動的資料，一變畫面就自動更新
  const [meals, setMeals] = useState<Meal[]>([]);
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
    const [loaded, setLoaded] = useState(false); // 讀檔完成了沒

  // ① App 打開時：讀取存檔（只跑一次）
  useEffect(() => {
    AsyncStorage.getItem("meals").then((saved) => {
      if (saved) setMeals(JSON.parse(saved)); // 文字 → 陣列
      setLoaded(true);
    });
  }, []);

  // ② meals 一有變動：存檔
  useEffect(() => {
    if (!loaded) return; // 還沒讀完就先不要存，避免空陣列蓋掉舊資料
    AsyncStorage.setItem("meals", JSON.stringify(meals)); // 陣列 → 文字
  }, [meals, loaded]);

  // 從餐點清單算出總和
  const eaten = meals.reduce((sum, m) => sum + m.kcal, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const left = goal - eaten;

  function addMeal() {
    const k = Number(kcal);
    if (!name.trim() || !k) return; // 沒填名稱或熱量就不加

    const newMeal: Meal = {
      id: Date.now().toString(),
      name: name.trim(),
      kcal: k,
      protein: Number(protein) || 0,
    };
    setMeals([...meals, newMeal]); // 舊清單 + 新的一筆

    // 清空輸入框、收起鍵盤
    setName("");
    setKcal("");
    setProtein("");
    Keyboard.dismiss();
  }
function deleteMeal(id: string) {
  setMeals(meals.filter((m) => m.id !== id)); // 留下 id 不一樣的，等於刪掉這筆
}
  return (
    <ScrollView contentContainerStyle={styles.container}>
  <Stack.Screen options={{ title: "今日飲食" }} />
      {/* 摘要 */}
      <Text style={styles.title}>今日熱量</Text>
      <Text style={styles.big}>{eaten} kcal</Text>
      <Text style={left < 0 ? styles.over : undefined}>
        目標 {goal}・{left >= 0 ? `剩餘 ${left}` : `超標 ${-left}`}
      </Text>
      <Text>蛋白質 {totalProtein} g</Text>

      {/* 表單 */}
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="餐點名稱（例：雞胸便當）"
          value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="熱量 kcal"
          keyboardType="numeric" value={kcal} onChangeText={setKcal} />
        <TextInput style={styles.input} placeholder="蛋白質 g"
          keyboardType="numeric" value={protein} onChangeText={setProtein} />
        <Pressable style={styles.button} onPress={addMeal}>
          <Text style={styles.buttonText}>新增</Text>
        </Pressable>
      </View>

      {/* 簡單列出（第 3 關會做得更完整） */}
      {meals.length === 0 && <Text style={{ color: "#999" }}>今天還沒有紀錄</Text>}

{meals.map((m) => (
  <View key={m.id} style={styles.row}>
    <View style={{ flex: 1 }}>
      <Text style={styles.mealName}>{m.name}</Text>
      <Text style={styles.mealInfo}>{m.kcal} kcal・蛋白質 {m.protein} g</Text>
    </View>
    <Pressable onPress={() => deleteMeal(m.id)}>
      <Text style={styles.delete}>刪除</Text>
    </Pressable>
  </View>
))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 60, gap: 6 },
  title: { fontSize: 18, color: "#666" },
  big: { fontSize: 48, fontWeight: "bold" },
  over: { color: "red", fontWeight: "bold" },
  form: { marginVertical: 16, gap: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, fontSize: 16 },
  button: { backgroundColor: "#2e7d32", padding: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  row: { flexDirection: "row", alignItems: "center", padding: 12,
         backgroundColor: "white", borderRadius: 8 },
  mealName: { fontSize: 16, fontWeight: "bold" },
  mealInfo: { color: "#666", marginTop: 2 },
  delete: { color: "red", padding: 8 },
});
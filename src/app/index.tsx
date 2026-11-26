import { useState } from "react";
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

// 一筆餐點長這樣
type Meal = { id: string; name: string; kcal: number; protein: number };

export default function Index() {
  const goal = 2000;

  // useState：會變動的資料，一變畫面就自動更新
  const [meals, setMeals] = useState<Meal[]>([]);
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");

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

  return (
    <View style={styles.container}>
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
      {meals.map((m) => (
        <Text key={m.id}>・{m.name}　{m.kcal} kcal　{m.protein} g</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60, gap: 6 },
  title: { fontSize: 18, color: "#666" },
  big: { fontSize: 48, fontWeight: "bold" },
  over: { color: "red", fontWeight: "bold" },
  form: { marginVertical: 16, gap: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, fontSize: 16 },
  button: { backgroundColor: "#2e7d32", padding: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
// 一筆餐點長這樣
type Meal = { id: string; name: string; kcal: number; protein: number; date: string };
// 常用食物：只有名稱和營養，沒有 id 和日期
type Food = { name: string; kcal: number; protein: number };
// 取得今天日期，格式 2026-11-26
function todayStr() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0"); // 月份從 0 開始，要 +1
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
export default function Index() {
  const goal = 2000;

  // useState：會變動的資料，一變畫面就自動更新
  const [meals, setMeals] = useState<Meal[]>([]);
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [loaded, setLoaded] = useState(false); // 讀檔完成了沒
  const [favorites, setFavorites] = useState<Food[]>([]);

  // ① App 打開時：讀取存檔（只跑一次）
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem("meals"),
      AsyncStorage.getItem("favorites"),
    ]).then(([savedMeals, savedFavs]) => {
      if (savedMeals) setMeals(JSON.parse(savedMeals));
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
      setLoaded(true);
    });
  }, []);

  // ② meals 一有變動：存檔
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem("meals", JSON.stringify(meals));
  }, [meals, loaded]);

  // ③ favorites 一有變動：存檔
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites, loaded]);
  const todayMeals = meals.filter((m) => m.date === todayStr());
  // 從餐點清單算出總和
  const eaten = todayMeals.reduce((sum, m) => sum + m.kcal, 0);
  const totalProtein = todayMeals.reduce((sum, m) => sum + m.protein, 0);
  const left = goal - eaten;

  // 共用：把一份食物記成今天的一筆
  function pushMeal(food: Food) {
    setMeals([...meals, { ...food, id: Date.now().toString(), date: todayStr() }]);
  }

  function addMeal() {
    const k = Number(kcal);
    if (!name.trim() || !k) return;
    pushMeal({ name: name.trim(), kcal: k, protein: Number(protein) || 0 });
    setName("");
    setKcal("");
    setProtein("");
    Keyboard.dismiss();
  }

  function addFavorite(m: Meal) {
    if (favorites.some((f) => f.name === m.name)) return; // 已經有了就不重複加
    setFavorites([...favorites, { name: m.name, kcal: m.kcal, protein: m.protein }]);
  }

  function removeFavorite(name: string) {
    setFavorites(favorites.filter((f) => f.name !== name));
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
      {/* 常用食物 */}
      {favorites.length > 0 && (
        <View style={styles.chips}>
          {favorites.map((f) => (
            <View key={f.name} style={styles.chip}>
              <Pressable onPress={() => pushMeal(f)}>
                <Text>{f.name}・{f.kcal}</Text>
              </Pressable>
              <Pressable onPress={() => removeFavorite(f.name)}>
                <Text style={{ color: "#999" }}>✕</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
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

      {/* 今日清單 */}
      {todayMeals.length === 0 && <Text style={{ color: "#999" }}>今天還沒有紀錄</Text>}

      {todayMeals.map((m) => (
        <View key={m.id} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.mealName}>{m.name}</Text>
            <Text style={styles.mealInfo}>{m.kcal} kcal・蛋白質 {m.protein} g</Text>
          </View>
          <Pressable onPress={() => addFavorite(m)}>
            <Text style={styles.fav}>☆ 常用</Text>
          </Pressable>
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
  row: {
    flexDirection: "row", alignItems: "center", padding: 12,
    backgroundColor: "white", borderRadius: 8
  },
  mealName: { fontSize: 16, fontWeight: "bold" },
  mealInfo: { color: "#666", marginTop: 2 },
  delete: { color: "red", padding: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  chip: {
    flexDirection: "row", gap: 8, alignItems: "center", backgroundColor: "#e8f5e9",
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20
  },
  fav: { color: "#2e7d32", padding: 8 },
});
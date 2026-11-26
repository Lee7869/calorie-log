import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type Meal = { id: string; name: string; kcal: number; protein: number; date: string };

// Date → "2026-11-26"
function dateStr(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// 最近 7 天的日期，由舊到新
function last7Days() {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i); // 往回推 i 天
    days.push(dateStr(d));
  }
  return days;
}

export default function Stats() {
  const goal = 2000;
  const [meals, setMeals] = useState<Meal[]>([]);

  // 每次切到這個分頁就重新讀取（因為另一頁可能新增了資料）
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("meals").then((saved) => {
        setMeals(saved ? JSON.parse(saved) : []);
      });
    }, [])
  );

  // 每天加總
  const data = last7Days().map((day) => ({
    day,
    kcal: meals.filter((m) => m.date === day).reduce((s, m) => s + m.kcal, 0),
  }));

  // 最高的那根決定比例（至少以目標為準）
  const max = Math.max(goal, ...data.map((d) => d.kcal));

  // 只算有紀錄的日子的平均
  const recorded = data.filter((d) => d.kcal > 0);
  const avg = recorded.length
    ? Math.round(recorded.reduce((s, d) => s + d.kcal, 0) / recorded.length)
    : 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>最近 7 天</Text>
      <Text>有紀錄的日子平均 {avg} kcal（目標 {goal}）</Text>

      <View style={styles.chart}>
        {data.map((d) => (
          <View key={d.day} style={styles.col}>
            <Text style={styles.value}>{d.kcal || ""}</Text>
            <View
              style={[
                styles.bar,
                {
                  height: (d.kcal / max) * 200,
                  backgroundColor: d.kcal > goal ? "#e53935" : "#2e7d32",
                },
              ]}
            />
            <Text style={styles.label}>{d.day.slice(5)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 6 },
  title: { fontSize: 22, fontWeight: "bold" },
  chart: { flexDirection: "row", alignItems: "flex-end", height: 260, gap: 8, marginTop: 24 },
  col: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  bar: { width: "70%", borderRadius: 4 },
  value: { fontSize: 11, color: "#666", marginBottom: 4 },
  label: { fontSize: 12, color: "#666", marginTop: 4 },
});
import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  const goal = 2000;   // 每日目標熱量
  const eaten = 850;   // 今天已吃（先寫死）
  const left = goal - eaten;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>今日熱量</Text>
      <Text style={styles.big}>{eaten} kcal</Text>
      <Text>目標 {goal}・剩餘 {left}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  title: { fontSize: 18, color: "#666" },
  big: { fontSize: 48, fontWeight: "bold" },
});

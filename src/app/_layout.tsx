import { Tabs } from "expo-router";

export default function RootLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "今日飲食" }} />
      <Tabs.Screen name="stats" options={{ title: "週統計" }} />
    </Tabs>
  );
}
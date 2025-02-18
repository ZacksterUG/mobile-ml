import { Tabs } from "expo-router";


export default function TabLayout() {
  return (
  <Tabs>
    <Tabs.Screen name="index" options={{ title: 'Главная' }}/>
    <Tabs.Screen name="image_input" options={{ title: 'Загрузить' }}/>
    <Tabs.Screen name="drawing_screen" options={{ title: 'Порисовать' }}/>
  </Tabs>
  )
}

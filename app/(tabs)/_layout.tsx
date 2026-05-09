import { Tabs } from 'expo-router';
import React from 'react';

import { NavBar } from '@/components/nav-bar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <NavBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages' }} />
    </Tabs>
  );
}

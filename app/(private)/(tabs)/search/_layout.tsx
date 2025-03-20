import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const Layout = () => {
    return (
        <Stack
            screenOptions={{ contentStyle: { backgroundColor: '#fff' }, headerShown: false }}>
            <Stack.Screen name="search" />
            <Stack.Screen name="profile/[id]" />
        </Stack>
    )
}

export default Layout
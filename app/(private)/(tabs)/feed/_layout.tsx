import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const Layout = () => {
    return (
        <Stack
            screenOptions={{
                contentStyle: {
                    backgroundColor: '#fff',
                },
            }}>
            <Stack.Screen name="home" options={{ headerShown: false }} />
        </Stack>
    )
}

export default Layout
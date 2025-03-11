import { View, StatusBar } from 'react-native';
import React from 'react';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const Layout = () => {
    return (
        <View style={{ flex: 1 }}>
            {/* Set status bar to dark content */}
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: '#000',
                    tabBarBackground: () => (
                        <BlurView
                            intensity={60}
                            tint={'systemUltraThinMaterialLight'}
                            style={{
                                flex: 1,
                                backgroundColor: 'rgba(0,0,0,0.001)'
                            }}
                        />
                    ),
                    tabBarStyle: {
                        paddingTop: 8,
                        backgroundColor: 'transparent',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        borderTopWidth: 0,
                        elevation: 0,
                    }
                }}
            >
                <Tabs.Screen
                    name="home2"
                    options={{
                        title: '',
                        tabBarIcon: ({ size, color, focused }) => (
                            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
                        ),
                        headerShown: false
                    }}
                />
                <Tabs.Screen
                    name="search2"
                    options={{
                        title: '',
                        tabBarIcon: ({ size, color, focused }) => (
                            <Ionicons name={focused ? 'search' : 'search-outline'} size={size} color={color} />
                        ),
                        headerShown: false
                    }}
                />
            </Tabs>
        </View>
    );
};

export default Layout;
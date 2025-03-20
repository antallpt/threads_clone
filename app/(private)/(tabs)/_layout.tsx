import {
    View,
    TouchableOpacity,
    StyleSheet,
    Animated,
    StatusBar,
} from 'react-native';
import React, { useRef } from 'react';
import { Tabs } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import {
    BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import ThreadComposer, { ThreadComposerRef } from '@/components/ThreadComposer';

const Layout = () => {
    const threadComposerRef = useRef<ThreadComposerRef>(null);
    const mainScaleValue = useRef(new Animated.Value(1)).current;

    const openThreadComposer = () => {
        if (threadComposerRef.current) {
            threadComposerRef.current.openSheet();
        }
    };

    return (
        <>
            <StatusBar barStyle="dark-content" />

            <Animated.View
                style={[
                    styles.backgroundOverlay,
                ]}
            />

            <Animated.View
                style={[
                    styles.animatedBackground,
                    {
                        transform: [{ scale: mainScaleValue }],
                    },
                ]}
            >
                <ThreadComposer
                    ref={threadComposerRef}
                    mainScaleValue={mainScaleValue}
                />
                <Tabs
                    screenOptions={{
                        tabBarActiveTintColor: '#000',
                        tabBarStyle: {
                            backgroundColor: '#fff',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            borderTopWidth: 0,
                            elevation: 0,
                            paddingTop: 10,
                        },
                    }}
                >
                    <Tabs.Screen
                        name="feed"
                        options={{
                            title: '',
                            tabBarIcon: ({ size, color, focused }) => (
                                <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
                            ),
                            headerShown: false
                        }}
                    />
                    <Tabs.Screen
                        name="search"
                        options={{
                            title: '',
                            tabBarIcon: ({ size, color, focused }) => (
                                <Ionicons name={focused ? 'search' : 'search-outline'} size={size} color={color} />
                            ),
                            headerShown: false
                        }}
                    />

                    <Tabs.Screen
                        name="create"
                        options={{
                            title: '',
                            tabBarIcon: ({ size }) => (
                                <TouchableOpacity onPress={openThreadComposer} activeOpacity={1}>
                                    <View style={styles.createButton}>
                                        <Feather name="plus" size={25} color={'#b0b0b0'} />
                                    </View>
                                </TouchableOpacity>
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name="activity"
                        options={{
                            title: '',
                            tabBarIcon: ({ size, color, focused }) => (
                                <Ionicons name={focused ? 'heart' : 'heart-outline'} size={size} color={color} />
                            ),
                            headerShown: false
                        }}
                    />
                    <Tabs.Screen
                        name="profile"
                        options={{
                            title: '',
                            tabBarIcon: ({ size, color, focused }) => (
                                <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
                            ),
                            headerShown: false
                        }}
                    />
                </Tabs>
            </Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
    // Your existing styles
    backgroundOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "black",
    },
    animatedBackground: {
        flex: 1,
        overflow: 'hidden',
        backgroundColor: '#fff',
        borderRadius: 20,
    },
    createButton: {
        width: 46,
        height: 39,
        borderRadius: 10,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Layout;
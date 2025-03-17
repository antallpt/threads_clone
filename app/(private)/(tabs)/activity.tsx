import { View, Text, Animated, StyleSheet, TextInput, ScrollView, Dimensions, TouchableOpacity, Keyboard, Easing } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur'; // Import BlurView from expo-blur

const searchTest = () => {
    const HEADER_HEIGHT = 60;
    const SEARCH_HEIGHT = 44;

    // Add state to track selected tab
    const [selectedTab, setSelectedTab] = useState('All');

    const scrollY = useRef(new Animated.Value(0)).current;
    const searchBarTranslateY = useRef(new Animated.Value(0)).current;
    const headerHeight = useRef(new Animated.Value(60)).current;
    const headerOpacityAnim = useRef(new Animated.Value(1)).current;

    const insets = useSafeAreaInsets();

    // Header fade and translate animation with much smoother transition
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_HEIGHT * 0.4, HEADER_HEIGHT * 0.8],
        outputRange: [1, 0.8, 0],
        extrapolate: 'clamp'
    });

    // Slow down the header movement to make it feel more synchronized
    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, HEADER_HEIGHT * 1.5],
        outputRange: [0, -HEADER_HEIGHT - insets.top],
        extrapolate: 'clamp'
    });

    // Vertical scroll event handler with damping for smoother feel
    const handleVerticalScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: false,
            listener: (event) => {
                // We could add velocity-based adjustments here if needed
            },
        }
    );

    // Helper function to determine tab style based on selection
    const getTabStyle = (tabName: string) => {
        return [
            styles.btn,
            selectedTab === tabName ? styles.selectedBtn : styles.unselectedBtn
        ];
    };

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.contentWrapper,
                    {
                        paddingTop: scrollY.interpolate({
                            inputRange: [0, HEADER_HEIGHT * 1.5],
                            outputRange: [
                                HEADER_HEIGHT + HEADER_HEIGHT + SEARCH_HEIGHT + 15,
                                HEADER_HEIGHT + SEARCH_HEIGHT - 15
                            ],
                            extrapolate: 'clamp'
                        }),
                    }
                ]}
            >
                <ScrollView
                    style={styles.page}
                    scrollEventThrottle={8}
                    onScroll={handleVerticalScroll}
                    showsVerticalScrollIndicator={false}
                    decelerationRate="normal"
                >
                    {/* Demo content */}
                    {Array(20).fill(0).map((_, i) => (
                        <View key={i} style={styles.contentItem}>
                            <Text style={styles.contentText}>Content item {i + 1}</Text>
                        </View>
                    ))}
                </ScrollView>
            </Animated.View>

            <Animated.View
                style={[
                    styles.headerContainer,
                    {
                        paddingTop: insets.top,
                        height: Animated.add(headerHeight, SEARCH_HEIGHT),
                        transform: [{ translateY: headerTranslateY }],
                        opacity: Animated.multiply(headerOpacity, headerOpacityAnim),
                    }
                ]}>
                <Text style={styles.header}>Activity</Text>
                <Ionicons name='notifications-off-outline' color={'#000'} size={28} style={{ paddingBottom: 1 }} />
            </Animated.View>

            <Animated.View
                style={[
                    styles.searchContainer,
                    {
                        top: Animated.add(
                            insets.top,
                            Animated.add(
                                headerHeight,
                                scrollY.interpolate({
                                    inputRange: [0, HEADER_HEIGHT * 0.3, HEADER_HEIGHT * 1.5],
                                    outputRange: [0, -HEADER_HEIGHT * 0.2, -HEADER_HEIGHT],
                                    extrapolate: 'clamp'
                                })
                            )
                        ),
                        paddingHorizontal: 16,
                        paddingVertical: 2,
                        zIndex: 20,
                    }
                ]}
                pointerEvents="box-none"
            >
                <Animated.View style={[
                    styles.searchLayout,
                    {
                        transform: [{ translateY: searchBarTranslateY }]
                    }
                ]} pointerEvents='auto'>
                    <Animated.View
                        style={[
                            styles.searchBar,
                            { paddingRight: 0 } // Explicitly override right padding
                        ]}
                    >
                        <View style={styles.tabsWrapper}>
                            {/* Blur Effect behind tabs */}
                            <BlurView
                                intensity={5}
                                tint="light"
                                style={styles.bottomBlur}
                            />

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.tabsContainer}
                                contentInset={{ right: 0 }}
                                scrollIndicatorInsets={{ right: 0 }}
                                style={[{ marginRight: -16 }, styles.tabsScrollView]} // Added tabsScrollView style
                            >
                                <TouchableOpacity
                                    style={getTabStyle('All')}
                                    onPress={() => setSelectedTab('All')}
                                >
                                    <Text style={styles.tabText}>All</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={getTabStyle('Requests')}
                                    onPress={() => setSelectedTab('Requests')}
                                >
                                    <Text style={styles.tabText}>Requests</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={getTabStyle('Replies')}
                                    onPress={() => setSelectedTab('Replies')}
                                >
                                    <Text style={styles.tabText}>Replies</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={getTabStyle('Mentions')}
                                    onPress={() => setSelectedTab('Mentions')}
                                >
                                    <Text style={styles.tabText}>Mentions</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={getTabStyle('Quotes')}
                                    onPress={() => setSelectedTab('Quotes')}
                                >
                                    <Text style={styles.tabText}>Quotes</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[getTabStyle('Reposts'), styles.lastTab]}
                                    onPress={() => setSelectedTab('Reposts')}
                                >
                                    <Text style={styles.tabText}>Reposts</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    headerContainer: {
        position: 'absolute',
        top: 10,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 16
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: 'black',
    },
    contentWrapper: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
    },
    page: {
        width: '100%',
        paddingHorizontal: 16,
        marginBottom: 80,
    },
    contentItem: {
        padding: 15,
        marginBottom: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    contentText: {
        fontSize: 16,
        color: '#333',
    },
    searchLayout: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 43,
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
    },
    backButton: {
        justifyContent: 'center',
        height: 40,
        width: 40,
        backgroundColor: 'transparent',
    },
    searchContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        zIndex: 15,
        height: 44,
        overflow: 'visible', // Allow content to overflow
    },
    // Base button style
    btn: {
        width: 100,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 20,
        borderColor: '#D0D0D0',
        borderWidth: 0.8,
    },
    // Selected and unselected states
    selectedBtn: {
        backgroundColor: '#F0F0F0',
    },
    unselectedBtn: {
        backgroundColor: 'white',
    },
    tabText: {
        fontWeight: '500',
    },
    // Container style for tabs with proper spacing
    tabsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 16, // Add padding that will be canceled out
        gap: 10, // This adds the 10px gap between items
    },
    // Style for the last tab item
    lastTab: {
        marginRight: 0,
    },
    // New styles for blur effect
    tabsWrapper: {
        position: 'relative',
        width: '100%',
        height: 43, // Match the searchLayout height
    },
    bottomBlur: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 12,
        overflow: 'hidden',
        zIndex: 1, // Place behind the tab buttons
    },
    tabsScrollView: {
        position: 'relative',
        zIndex: 2, // Ensure tabs are above the blur
    },
});

export default searchTest
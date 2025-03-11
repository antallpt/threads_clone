import { View, FlatList, StyleSheet, RefreshControl, Animated, Text } from 'react-native';
import React, { useState, useRef, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomHeader, { CustomHeaderRef } from '@/components/CustomHeader';

const Home2 = () => {
    const [refreshing, setRefreshing] = useState(false);
    const headerRef = useRef<CustomHeaderRef>(null);
    const scrollY = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();

    // Dummy data
    const data = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);
    const HEADER_HEIGHT = 60; // Estimated header height

    // Pull-to-refresh handler
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        headerRef.current?.startRefresh(); // Start header animation
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    // Handle scroll events for header animation
    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
    );

    return (
        <View style={styles.container}>
            {/* Header that fades out when scrolling */}
            <Animated.View
                style={[
                    styles.headerContainer,
                    {
                        paddingTop: insets.top,
                        height: HEADER_HEIGHT + insets.top,
                    }
                ]}
            >
                <CustomHeader ref={headerRef} scrollY={scrollY} />
            </Animated.View>

            <FlatList
                contentContainerStyle={{
                    paddingTop: insets.top + 60,
                    paddingBottom: insets.bottom + 60, // Account for tab bar
                }}
                data={data}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.listItem}>
                        <Text style={styles.itemText}>{item}</Text>
                    </View>
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        progressViewOffset={60 + insets.top} // Account for header height
                        tintColor="transparent"
                    />
                }
                onScroll={handleScroll}
                scrollEventThrottle={16} // For smooth animations
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        zIndex: 10,
    },
    listItem: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginHorizontal: 15,
    },
    itemText: {
        fontSize: 16,
        color: '#333',
    }
});

export default Home2;
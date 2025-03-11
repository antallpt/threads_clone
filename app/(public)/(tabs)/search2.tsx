import { View, Text, StyleSheet, Animated } from 'react-native';
import React, { useRef } from 'react';
import CustomHeader, { CustomHeaderRef } from '@/components/CustomHeader';
import SearchBar from '@/components/SearchBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Search2 = () => {
    const headerRef = useRef<CustomHeaderRef>(null);
    const scrollY = useRef(new Animated.Value(0)).current; // Create scrollY animated value
    const insets = useSafeAreaInsets(); // Get safe area insets for notches, etc.

    const HEADER_HEIGHT = 60; // Estimated header height

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

            {/* Search container with proper spacing from top */}
            <View style={[styles.searchContainer, { marginTop: insets.top + 60 }]}>
                <SearchBar />
            </View>

            {/* Text container between search bar and tab bar */}
            <View style={[styles.textContainer, { paddingBottom: insets.bottom + 60 }]}>
                <Text style={styles.text}>Search for profiles to explore</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    searchContainer: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#9c9c9c',
        fontSize: 16,
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        zIndex: 10,
    },
});

export default Search2;
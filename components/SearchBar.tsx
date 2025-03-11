import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Keyboard, Animated, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';

const SearchBar = () => {
    const [searchText, setSearchText] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const searchWidthAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.timing(searchWidthAnim, {
            toValue: isFocused ? 0.8 : 1, // Verkleinere auf 80%, wenn fokussiert
            duration: 150,
            easing: Easing.inOut(Easing.ease), // Sanfte Ease-in-out-Animation
            useNativeDriver: false,
        }).start();
    }, [isFocused]);

    const handleDismiss = () => {
        setSearchText('');
        setIsFocused(false);
        Keyboard.dismiss();
    };

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.searchContainer,
                    { width: searchWidthAnim.interpolate({ inputRange: [0.8, 1], outputRange: ['80%', '100%'] }) },
                ]}
            >
                <Feather name="search" size={18} color="#9c9c9c" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Search"
                    placeholderTextColor="#9c9c9c"
                    value={searchText}
                    onChangeText={setSearchText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
            </Animated.View>

            {isFocused && (
                <TouchableOpacity onPress={handleDismiss} style={styles.cancelButton}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fafafa',
        borderRadius: 17,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: 'black',
    },
    cancelButton: {
        padding: 10,
        marginLeft: 10,
    },
    cancelText: {
        fontSize: 16,
        color: 'black',
    },
});

export default SearchBar;
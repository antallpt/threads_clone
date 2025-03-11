import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Keyboard,
    FlatList,
    Dimensions,
    StatusBar,
    SafeAreaView
} from 'react-native';
import { Ionicons, Feather, Entypo } from '@expo/vector-icons';

// Define types
type SearchResultItem = {
    id: string;
    username: string;
    name: string;
    followers: string;
    verified: boolean;
    color: string;
    initial: string;
};

// Mock data
const SEARCH_RESULTS: SearchResultItem[] = [
    {
        id: '1',
        username: 'kodi_98',
        name: 'Kodrian Bolog',
        followers: '52,2K',
        verified: true,
        color: '#FF5252',
        initial: 'K'
    },
    {
        id: '2',
        username: 'bmw',
        name: 'BMW',
        followers: '5,7 M',
        verified: true,
        color: '#9C27B0',
        initial: 'B'
    },
    {
        id: '3',
        username: 'minh.lrz',
        name: 'Minh Lorz',
        followers: '127',
        verified: false,
        color: '#9C27B0',
        initial: 'M'
    },
    {
        id: '4',
        username: 'berliner_zeitung',
        name: 'Berliner Zeitung',
        followers: '16,6K',
        verified: true,
        color: '#4CAF50',
        initial: 'B'
    },
    {
        id: '5',
        username: 'sn.1o3o1.pi',
        name: '🇩🇪MH🇩🇪',
        followers: '17',
        verified: false,
        color: '#FFEB3B',
        initial: 'S'
    },
    {
        id: '6',
        username: 'ishowspeed',
        name: 'IShowSpeed',
        followers: '3,5 M',
        verified: true,
        color: '#2196F3',
        initial: 'I'
    },
    {
        id: '7',
        username: 'jamiee.q2',
        name: 'Elias',
        followers: '44',
        verified: false,
        color: '#FF9800',
        initial: 'J'
    }
];

const { width } = Dimensions.get('window');

const SearchScreen = () => {
    // States
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Animation values
    const resultsOpacity = useRef(new Animated.Value(1)).current;
    const searchBarWidth = useRef(new Animated.Value(width - 32)).current;
    const searchBarTranslateY = useRef(new Animated.Value(0)).current;
    const filterOpacity = useRef(new Animated.Value(0)).current;
    const headerHeight = useRef(new Animated.Value(60)).current;
    const headerOpacity = useRef(new Animated.Value(1)).current;

    // Modify handleSearchFocus to include proper animations
    const handleSearchFocus = () => {
        setIsSearchFocused(true);

        // Animate components with fixed values
        Animated.parallel([
            // Animate search bar width
            Animated.timing(searchBarWidth, {
                toValue: width - 65,  // Less width when focused to leave space for back button
                duration: 250,
                useNativeDriver: false
            }),
            // Animate search bar moving up to the header position
            Animated.timing(searchBarTranslateY, {
                toValue: 0,  // Small offset to move up
                duration: 250,
                useNativeDriver: true
            }),
            // Animate header height and opacity to collapse it
            Animated.timing(headerHeight, {
                toValue: 0,
                duration: 250,
                useNativeDriver: false
            }),
            Animated.timing(headerOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false
            }),
            // Animate filter icon appearing
            Animated.timing(filterOpacity, {
                toValue: 1,
                duration: 250,
                useNativeDriver: false
            }),
            // Fade out results immediately
            Animated.timing(resultsOpacity, {
                toValue: 0,
                duration: 100,
                useNativeDriver: false
            })
        ]).start();
    };

    // Update handleSearchBlur to restore search bar position
    const handleSearchBlur = () => {
        setIsSearchFocused(false);
        Keyboard.dismiss();
        setSearchQuery('');

        // Animate components back to initial state
        Animated.parallel([
            // Animate search bar width
            Animated.timing(searchBarWidth, {
                toValue: width - 32,
                duration: 250,
                useNativeDriver: false
            }),
            // Animate search bar back to original position
            Animated.timing(searchBarTranslateY, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true
            }),
            // Restore header height and opacity
            Animated.timing(headerHeight, {
                toValue: 60,
                duration: 250,
                useNativeDriver: false
            }),
            Animated.timing(headerOpacity, {
                toValue: 1,
                duration: 250,
                useNativeDriver: false
            }),
            // Animate filter icon disappearing
            Animated.timing(filterOpacity, {
                toValue: 0,
                duration: 150,
                useNativeDriver: false
            }),
            // Fade in results
            Animated.timing(resultsOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false
            })
        ]).start();
    };

    // Avatar placeholder component
    const AvatarPlaceholder = ({ color, initial }: { color: string, initial: string }) => (
        <View style={[styles.avatar, { backgroundColor: color }]}>
            <Text style={styles.avatarText}>{initial}</Text>
        </View>
    );

    // Render search result item
    const renderSearchResult = ({ item }: { item: SearchResultItem }) => (
        <View style={styles.resultItem}>
            <AvatarPlaceholder color={item.color} initial={item.initial} />
            <View style={styles.userInfoContainer}>
                <View style={styles.usernameRow}>
                    <Text style={styles.username}>{item.username}</Text>
                    {item.verified && (
                        <Ionicons name="checkmark-circle" size={15} color="#3897f0" style={styles.verifiedIcon} />
                    )}
                </View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.followers}>{item.followers} followers</Text>
            </View>
            <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header title with animated height and opacity */}
            <Animated.View style={[
                styles.header,
                {
                    height: headerHeight,
                    opacity: headerOpacity
                }
            ]}>
                <Text style={styles.headerTitle}>Search</Text>
            </Animated.View>

            {/* Search bar layout with flex row */}
            <Animated.View style={[
                styles.searchLayout,
                {
                    // Apply Y translation to the entire row
                    transform: [{ translateY: searchBarTranslateY }]
                }
            ]}>
                {/* Back button */}
                {isSearchFocused && (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleSearchBlur}
                    >
                        <Entypo name="chevron-thin-left" size={20} color="#000" />
                    </TouchableOpacity>
                )}

                {/* Search bar container with animated width */}
                <View style={styles.searchBarContainer}>
                    <Animated.View
                        style={[
                            styles.searchBar,
                            { width: searchBarWidth }
                        ]}
                    >
                        <Feather name="search" size={16} color="#8e8e8e" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search"
                            placeholderTextColor="#8e8e8e"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onFocus={handleSearchFocus}
                        />

                        {/* Filter icon inside search bar */}
                        <Animated.View style={{ opacity: filterOpacity }}>
                            <Feather name="sliders" size={18} color="#8e8e8e" />
                        </Animated.View>
                    </Animated.View>
                </View>
            </Animated.View>

            {/* Search results - only visible when not focused */}
            <Animated.View style={[
                styles.resultsContainer,
                { opacity: resultsOpacity }
            ]}>
                <FlatList
                    data={SEARCH_RESULTS}
                    renderItem={renderSearchResult}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                />
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    // Updated search layout with flex row
    searchLayout: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        paddingHorizontal: 16,
        justifyContent: 'space-between', // This will push the search bar to the right when back button appears
    },
    searchBarContainer: {
        flex: 1,
        alignItems: 'flex-end', // Aligns the search bar to the right
    },
    backButton: {
        justifyContent: 'center',
        height: 40,
        width: 40,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFEFEF',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 40,
        justifyContent: 'space-between',
        // Use flex to expand and fill available space
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
    },
    resultsContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    userInfoContainer: {
        flex: 1,
        marginLeft: 12,
    },
    usernameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    username: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    verifiedIcon: {
        marginLeft: 4,
    },
    name: {
        fontSize: 14,
        color: '#8e8e8e',
    },
    followers: {
        fontSize: 12,
        color: '#8e8e8e',
    },
    followButton: {
        backgroundColor: '#000',
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 5,
    },
    followButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    bottomTabs: {
        flexDirection: 'row',
        height: 50,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    tabItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeTab: {
        // Active tab styles if needed
    },
    createButton: {
        width: 46,
        height: 37,
        borderRadius: 10,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default SearchScreen;
import { View, Text, Animated, StyleSheet, TextInput, Dimensions, TouchableOpacity, Keyboard, Easing } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Entypo, Feather } from '@expo/vector-icons';
import { FlatList } from 'react-native-gesture-handler';
import ProfileSearchResult from '@/components/ProfileSearchResult';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { router, Stack } from 'expo-router';
import { Doc } from '@/convex/_generated/dataModel';

const { width } = Dimensions.get('window');

const SearchTest = () => {
    const [search, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Fixed the issue with the query - properly handle empty search
    const userList = useQuery(api.users.searchUsers,
        debouncedSearch && debouncedSearch.length > 0 ? { search: debouncedSearch } : "skip"
    );

    const HEADER_HEIGHT = 60;
    const SEARCH_HEIGHT = 44;
    const ANIMATION_DURATION = 200;

    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [currentScrollY, setCurrentScrollY] = useState(0);

    const scrollY = useRef(new Animated.Value(0)).current;
    const filterOpacity = useRef(new Animated.Value(0)).current;
    const searchBarWidth = useRef(new Animated.Value(width - 32)).current;
    const backButtonOpacity = useRef(new Animated.Value(0)).current;
    const backButtonWidth = useRef(new Animated.Value(0)).current;
    const searchBarTranslateY = useRef(new Animated.Value(0)).current;
    const headerHeight = useRef(new Animated.Value(60)).current;
    const headerOpacityAnim = useRef(new Animated.Value(1)).current;
    const resultsOpacity = useRef(new Animated.Value(1)).current;
    const shadowAnim = useRef(new Animated.Value(0)).current;

    const insets = useSafeAreaInsets();

    // Debounce search query to prevent too many API calls
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => {
            clearTimeout(timerId);
        };
    }, [search]);

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

    const shadowOpacity = shadowAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0.15, 0.3],
        extrapolate: 'clamp'
    });

    const shadowElevation = shadowAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 2, 4],
        extrapolate: 'clamp'
    });

    const calculateShadowValue = (scrollPosition: number) => {
        // Much gentler shadow transition over a wider scroll range
        return Math.min(1, Math.max(0, scrollPosition / (HEADER_HEIGHT * 1.2)));
    };

    useEffect(() => {
        const scrollListener = scrollY.addListener(({ value }) => {
            // Only update current scroll if the change is significant
            if (Math.abs(value - currentScrollY) > 2) {
                setCurrentScrollY(value);
            }

            // Use a higher threshold to prevent unwanted state changes
            if (value > 5) {
                if (!scrolled) setScrolled(true);
            } else if (value < 1) {
                if (scrolled) setScrolled(false);
            }

            // Only update shadow when not focused
            if (!isSearchFocused) {
                shadowAnim.setValue(calculateShadowValue(value));
            }
        });

        return () => scrollY.removeListener(scrollListener);
    }, [isSearchFocused, scrolled, currentScrollY]);

    useEffect(() => {
        if (isSearchFocused) {
            Animated.timing(shadowAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: false,
            }).start();
        }
    }, [isSearchFocused]);

    // Vertical scroll event handler with damping for smoother feel
    const handleVerticalScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: false,
        }
    );

    const handleSearchFocus = () => {
        setIsSearchFocused(true);

        const animations = [
            // Animate search bar width
            Animated.timing(searchBarWidth, {
                toValue: width - 74,
                duration: ANIMATION_DURATION,
                useNativeDriver: false,
                easing: Easing.inOut(Easing.ease)
            }),
            // Animate filter icon appearing
            Animated.timing(filterOpacity, {
                toValue: 1,
                duration: ANIMATION_DURATION,
                useNativeDriver: false,
                easing: Easing.inOut(Easing.ease)
            }),
            // Animate back button appearing
            Animated.timing(backButtonOpacity, {
                toValue: 1,
                duration: ANIMATION_DURATION,
                useNativeDriver: false,
                easing: Easing.inOut(Easing.ease)
            }),
            // Animate back button width
            Animated.timing(backButtonWidth, {
                toValue: 40,
                duration: ANIMATION_DURATION,
                useNativeDriver: false,
                easing: Easing.inOut(Easing.ease)
            }),
            // Show results with animation
            Animated.timing(resultsOpacity, {
                toValue: 1, // Changed from 0 to 1 to make results visible
                duration: 100,
                useNativeDriver: false
            }),
        ]

        if (!scrolled) {
            // Add animation to move search bar up when header collapses
            animations.push(
                // Move search bar up to compensate for header collapsing
                Animated.timing(searchBarTranslateY, {
                    toValue: 0,
                    duration: ANIMATION_DURATION,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease)
                }),
                // Animate header height and opacity to collapse it
                Animated.timing(headerHeight, {
                    toValue: 0,
                    duration: ANIMATION_DURATION,
                    useNativeDriver: false,
                    easing: Easing.inOut(Easing.ease)
                }),
                // Fade out header
                Animated.timing(headerOpacityAnim, {
                    toValue: 0,
                    duration: ANIMATION_DURATION,
                    useNativeDriver: false,
                    easing: Easing.inOut(Easing.ease)
                })
            )
        }

        Animated.parallel(animations).start();
    }

    const handleSearchBlur = () => {
        setIsSearchFocused(false);
        Keyboard.dismiss();
        setSearchQuery('');

        const animations = [
            // Animate search bar width
            Animated.timing(searchBarWidth, {
                toValue: width - 32,
                duration: 200,
                useNativeDriver: false,
                easing: Easing.inOut(Easing.ease)
            }),
            // Animate filter icon disappearing
            Animated.timing(filterOpacity, {
                toValue: 0,
                duration: ANIMATION_DURATION,
                useNativeDriver: false,
                easing: Easing.inOut(Easing.ease)
            }),
            // Animate back button disappearing
            Animated.timing(backButtonOpacity, {
                toValue: 0,
                duration: ANIMATION_DURATION,
                useNativeDriver: false,
                easing: Easing.inOut(Easing.ease)
            }),
            // Animate back button width
            Animated.timing(backButtonWidth, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
                easing: Easing.inOut(Easing.ease)
            }),
            // Fade out results immediately
            Animated.timing(resultsOpacity, {
                toValue: 1,
                duration: 100,
                useNativeDriver: false
            }),
            Animated.timing(shadowAnim, {
                toValue: calculateShadowValue(currentScrollY),
                duration: ANIMATION_DURATION,
                useNativeDriver: false,
                easing: Easing.inOut(Easing.ease)
            })
        ]

        // Only restore header if not scrolled
        if (!scrolled) {
            animations.push(
                Animated.timing(searchBarTranslateY, {
                    toValue: 0,
                    duration: ANIMATION_DURATION,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease)
                }),
                // Restore header height
                Animated.timing(headerHeight, {
                    toValue: HEADER_HEIGHT,
                    duration: ANIMATION_DURATION,
                    useNativeDriver: false,
                    easing: Easing.inOut(Easing.ease)
                }),
                // Fade in header
                Animated.timing(headerOpacityAnim, {
                    toValue: 1,
                    duration: ANIMATION_DURATION,
                    useNativeDriver: false,
                    easing: Easing.inOut(Easing.ease)
                }),
            );
        }

        Animated.parallel(animations).start();
    }

    const navigateToProfile = (userId: string) => {
        // Close the search bar/keyboard
        handleSearchBlur();

        // Navigate to the profile page with userId param
        router.push({
            pathname: "/(private)/(tabs)/search/profile/[id]",
            params: { id: userId }
        });
    };

    // This component handles errors when rendering items in the FlatList
    const renderProfileSearchResult = ({ item }: { item: Doc<'users'> }) => {
        try {
            return (
                <TouchableOpacity
                    onPress={() => navigateToProfile(item._id)}
                    activeOpacity={0.7}
                >
                    <ProfileSearchResult key={item._id} user={item} />
                </TouchableOpacity>
            );
        } catch (error) {
            console.error('Error rendering ProfileSearchResult:', error, 'Item:', JSON.stringify(item));
            // Fallback component in case of rendering errors
            return (
                <View style={styles.errorItem}>
                    <Text>Error displaying user</Text>
                </View>
            );
        }
    };

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.contentWrapper,
                    {
                        paddingTop: insets.top + SEARCH_HEIGHT
                    }
                ]}
            >
                {/* Results are always visible when search is focused */}
                {isSearchFocused ? (
                    <View style={{ flex: 1 }}>
                        <FlatList
                            data={userList || []}
                            contentInsetAdjustmentBehavior="automatic"
                            ItemSeparatorComponent={() => (
                                <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: '#eee' }} />
                            )}
                            ListEmptyComponent={() => (
                                <Text style={styles.emptyText}>
                                    {search.length > 0 ? "No users found" : "Type to search for users"}
                                </Text>
                            )}
                            renderItem={renderProfileSearchResult}
                            keyExtractor={item => item._id}
                            onScroll={handleVerticalScroll}
                            scrollEventThrottle={8}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                ) : (
                    // Display an empty state when not searching
                    <View style={styles.initialSearchState}>
                        <Feather name="search" size={50} color="#8e8e8e" style={{ opacity: 0.5 }} />
                        <Text style={styles.searchPromptText}>Search for users</Text>
                    </View>
                )}
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
                <Text style={styles.header}>Search</Text>
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
                                    outputRange: [0, 0, 0],
                                    extrapolate: 'clamp'
                                })
                            )
                        ),
                        shadowOpacity: isSearchFocused ? 0 : shadowOpacity,
                        shadowRadius: 4,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        elevation: shadowElevation,
                        paddingHorizontal: 16,
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
                    {/* Back button */}
                    <Animated.View style={{
                        width: backButtonWidth,
                        opacity: backButtonOpacity,
                        overflow: 'hidden'
                    }}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={handleSearchBlur}
                        >
                            <Entypo name="chevron-thin-left" size={20} color="#000" />
                        </TouchableOpacity>
                    </Animated.View>
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
                            value={search}
                            onChangeText={setSearchQuery}
                            onFocus={handleSearchFocus}
                            autoCapitalize="none"
                        />

                        {/* Filter icon inside search bar */}
                        <Animated.View style={{ opacity: filterOpacity }}>
                            <Feather name="sliders" size={18} color="#8e8e8e" />
                        </Animated.View>
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
        flexDirection: 'row',
        alignItems: 'flex-end',
        top: 10,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: 'white',
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        paddingLeft: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        borderRadius: 17,
        paddingVertical: 12,
        paddingHorizontal: 20,
        justifyContent: 'space-between',
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
        paddingHorizontal: 16,
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
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
        color: '#8e8e8e',
    },
    initialSearchState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -40,
    },
    searchPromptText: {
        fontSize: 18,
        color: '#8e8e8e',
        marginTop: 16,
    },
    errorItem: {
        padding: 16,
        backgroundColor: '#fff0f0',
        borderRadius: 8,
        marginVertical: 4,
    }
});

export default SearchTest;
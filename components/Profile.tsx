import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    ScrollView,
    Dimensions,
    RefreshControl,
    StatusBar,
} from 'react-native';
import React, { useRef, useState, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AntDesign, Feather, FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ThreadComposer, { ThreadComposerRef } from '@/components/ThreadComposer';
import { Id } from '@/convex/_generated/dataModel';
import { useUserProfile } from '@/hooks/useUserProfile';
import UserProfile from '@/components/UserProfile';
import ProfileHeader from '@/components/ProfileHeader';


const screenWidth = Dimensions.get('window').width;
const padding = 20;
// Calculate tab width (screen width minus padding on both sides divided by number of tabs)
const tabWidth = (screenWidth - (padding * 2)) / 4;

const HEADER_HEIGHT = 40; // Estimated header height
const PROFILE_HEIGHT = 185; // Estimated profile section height
const TAB_HEIGHT = 40;   // Estimated tab height

type ProfileProps = {
    userId?: Id<'users'>;
}

const Profile = ({ userId }: ProfileProps) => {
    const { userProfile } = useUserProfile();

    const insets = useSafeAreaInsets();
    const threadComposerRef = useRef<ThreadComposerRef>(null);
    const mainScaleValue = useRef(new Animated.Value(1)).current;
    const scrollX = useRef(new Animated.Value(0)).current;
    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef<ScrollView>(null);
    const [refreshing, setRefreshing] = useState(false);

    const isSelf = !userId;

    // Header fade and translate animation
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_HEIGHT / 2],
        outputRange: [1, 0],
        extrapolate: 'clamp'
    });

    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, HEADER_HEIGHT + PROFILE_HEIGHT],
        outputRange: [0, -(HEADER_HEIGHT + PROFILE_HEIGHT)],
        extrapolate: 'clamp'
    });

    // Updated translateX animation to position the underline at exact segment boundaries
    const translateX = scrollX.interpolate({
        inputRange: [0, screenWidth, screenWidth * 2, screenWidth * 3],
        outputRange: [
            padding, // First tab starts at padding
            padding + tabWidth, // Second tab starts where first ends
            padding + tabWidth * 2, // Third tab starts where second ends
            padding + tabWidth * 3, // Fourth tab starts where third ends
        ],
        extrapolate: 'clamp'
    });

    // Tab text colors for all four tabs
    const firstTabColor = scrollX.interpolate({
        inputRange: [0, screenWidth],
        outputRange: ['#000', '#aaa'],
        extrapolate: 'clamp'
    });

    const secondTabColor = scrollX.interpolate({
        inputRange: [0, screenWidth, screenWidth * 2],
        outputRange: ['#aaa', '#000', '#aaa'],
        extrapolate: 'clamp'
    });

    const thirdTabColor = scrollX.interpolate({
        inputRange: [screenWidth, screenWidth * 2, screenWidth * 3],
        outputRange: ['#aaa', '#000', '#aaa'],
        extrapolate: 'clamp'
    });

    const fourthTabColor = scrollX.interpolate({
        inputRange: [screenWidth * 2, screenWidth * 3],
        outputRange: ['#aaa', '#000'],
        extrapolate: 'clamp'
    });

    // Switch tabs on tap
    const switchTab = (index: number) => {
        scrollViewRef.current?.scrollTo({ x: index * screenWidth, animated: true });
    };

    // Open thread composer
    const openThreadComposer = useCallback(() => {
        threadComposerRef.current?.openSheet();
    }, []);

    // Handle post submission
    const handlePostSubmit = useCallback((postText: string) => {
        console.log('Post submitted from Profile:', postText);
        // Here you can handle the post submission, e.g., add it to your posts list
    }, []);

    // Horizontal scroll event handler
    const handleHorizontalScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false }
    );

    // Vertical scroll event handler for both tabs
    const handleVerticalScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
    );

    // Create thread action
    const handleCreateThread = () => {
        openThreadComposer();
    };

    // Follow profiles action
    const handleSeeProfiles = () => {
        console.log('Navigate to profiles page');
    };

    // Define a constant rate for all scrolling animations
    const tabTranslateY = scrollY.interpolate({
        inputRange: [0, HEADER_HEIGHT + PROFILE_HEIGHT],
        outputRange: [
            insets.top + HEADER_HEIGHT + PROFILE_HEIGHT,
            insets.top
        ],
        extrapolate: 'clamp'
    });

    // Define consistent content padding animation
    const contentPaddingTop = scrollY.interpolate({
        inputRange: [0, HEADER_HEIGHT + PROFILE_HEIGHT],
        outputRange: [
            insets.top + HEADER_HEIGHT + PROFILE_HEIGHT + TAB_HEIGHT,
            insets.top + TAB_HEIGHT
        ],
        extrapolate: 'clamp'
    });

    return (
        <Animated.View style={[styles.backgroundOverlay]}>
            <Animated.View
                style={[
                    styles.animatedBackground,
                    isSelf && { borderRadius: 20 },
                    {
                        transform: [{ scale: mainScaleValue }],
                    },

                ]}
            >
                <View style={styles.container}>
                    <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

                    {/* Add this new View to cover the notch area */}
                    <View
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: insets.top,
                            backgroundColor: '#fff',
                            zIndex: 25, // Higher than all other components
                        }}
                    />

                    <ThreadComposer
                        ref={threadComposerRef}
                        onPostSubmit={handlePostSubmit}
                        mainScaleValue={mainScaleValue}
                    />

                    {/* Header that fades out when scrolling */}

                    {/* Profile section with adjusted scrolling animation */}
                    {userId ? (
                        <>
                            <ProfileHeader userId={userId} headerOpacity={headerOpacity} headerTranslateY={headerTranslateY} />
                            <UserProfile userId={userId} headerTranslateY={headerTranslateY} />
                        </>
                    ) : (
                        userProfile?._id ? (
                            <>
                                <ProfileHeader userId={userProfile._id} headerOpacity={headerOpacity} headerTranslateY={headerTranslateY} />
                                <UserProfile userId={userProfile._id} headerTranslateY={headerTranslateY} />
                            </>
                        ) : null
                    )}

                    {/* Main content container with tabs and content */}
                    <Animated.View style={styles.mainContainer}>
                        {/* Tab header with consistent animation */}
                        <Animated.View
                            style={[
                                styles.tabsOuterContainer,
                                {
                                    transform: [{ translateY: tabTranslateY }]
                                }
                            ]}
                        >
                            <View style={styles.tabsContainer}>
                                <TouchableOpacity onPress={() => switchTab(0)} style={styles.tab}>
                                    <Animated.Text
                                        style={[
                                            styles.tabText,
                                            { color: firstTabColor },
                                        ]}
                                    >
                                        Threads
                                    </Animated.Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => switchTab(1)} style={styles.tab}>
                                    <Animated.Text
                                        style={[
                                            styles.tabText,
                                            { color: secondTabColor },
                                        ]}
                                    >
                                        Replies
                                    </Animated.Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => switchTab(2)} style={styles.tab}>
                                    <Animated.Text
                                        style={[
                                            styles.tabText,
                                            { color: thirdTabColor },
                                        ]}
                                    >
                                        Media
                                    </Animated.Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => switchTab(3)} style={styles.tab}>
                                    <Animated.Text
                                        style={[
                                            styles.tabText,
                                            { color: fourthTabColor },
                                        ]}
                                    >
                                        Reposts
                                    </Animated.Text>
                                </TouchableOpacity>

                                {/* Animated underline - now with exact width and positioning */}
                                <Animated.View style={[
                                    styles.underline,
                                    {
                                        width: tabWidth, // Set to exact tab width
                                        transform: [{ translateX }]
                                    }
                                ]} />
                            </View>
                        </Animated.View>

                        {/* Content with synchronized padding animation */}
                        <Animated.View
                            style={[
                                styles.contentWrapper,
                                {
                                    paddingTop: contentPaddingTop
                                }
                            ]}
                        >
                            <ScrollView
                                ref={scrollViewRef}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                scrollEventThrottle={16}
                                onScroll={handleHorizontalScroll}
                            >
                                {/* Threads tab content */}
                                <ScrollView
                                    style={styles.page}
                                    scrollEventThrottle={16}
                                    onScroll={handleVerticalScroll}
                                    showsVerticalScrollIndicator={false}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing}
                                            progressViewOffset={insets.top + HEADER_HEIGHT + PROFILE_HEIGHT + TAB_HEIGHT}
                                            tintColor={'transparent'}
                                        />
                                    }
                                >
                                    {!userId && (
                                        <>
                                            <View style={styles.profileCompletion}>
                                                <Text style={styles.profileCompletionText}>Finish your profile</Text>
                                                <Text style={styles.profileCompletionCount}>3 left</Text>
                                            </View>

                                            <ScrollView
                                                horizontal
                                                contentInset={{ right: 0 }}
                                                contentContainerStyle={styles.cardsContainer}
                                                showsHorizontalScrollIndicator={false}
                                                style={{ marginRight: -16, marginBottom: 20 }}>
                                                <View style={styles.actionCard}>
                                                    <View style={styles.actionIconContainer}>
                                                        <FontAwesome name="pencil-square-o" color="#000" size={24} style={{ left: 2 }} />
                                                    </View>
                                                    <Text style={styles.actionTitle}>Create thread</Text>
                                                    <Text style={styles.actionDescription}>
                                                        Say what's on your mind or share a recent highlight.
                                                    </Text>
                                                    <TouchableOpacity
                                                        style={styles.actionButton}
                                                        onPress={handleCreateThread}
                                                    >
                                                        <Text style={styles.actionButtonText}>Create</Text>
                                                    </TouchableOpacity>
                                                </View>

                                                <View style={styles.actionCard}>
                                                    <View style={styles.actionIconContainer}>
                                                        <AntDesign name="addusergroup" color="#000" size={24} />
                                                    </View>
                                                    <Text style={styles.actionTitle}>Follow 10 profiles</Text>
                                                    <Text style={styles.actionDescription}>
                                                        Fill your feed with threads that interest you.
                                                    </Text>
                                                    <TouchableOpacity
                                                        style={styles.actionButton}
                                                        onPress={handleSeeProfiles}
                                                    >
                                                        <Text style={styles.actionButtonText}>See profiles</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </ScrollView>
                                        </>
                                    )}
                                    {/* Demo content */}
                                    {Array(20).fill(0).map((_, i) => (
                                        <View key={i} style={styles.contentItem}>
                                            <Text style={styles.contentText}>Content item {i + 1}</Text>
                                        </View>
                                    ))}
                                </ScrollView>

                                {/* Replies tab content */}
                                <ScrollView
                                    style={styles.page}
                                    scrollEventThrottle={16}
                                    onScroll={handleVerticalScroll}
                                    showsVerticalScrollIndicator={false}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing}
                                            progressViewOffset={insets.top + HEADER_HEIGHT + PROFILE_HEIGHT + TAB_HEIGHT}
                                            tintColor={'transparent'}
                                        />
                                    }
                                >
                                    {/* Demo content */}
                                    {Array(20).fill(0).map((_, i) => (
                                        <View key={i} style={styles.contentItem}>
                                            <Text style={styles.contentText}>Reply item {i + 1}</Text>
                                        </View>
                                    ))}
                                </ScrollView>

                                {/* Media tab content */}
                                <ScrollView
                                    style={styles.page}
                                    scrollEventThrottle={16}
                                    onScroll={handleVerticalScroll}
                                    showsVerticalScrollIndicator={false}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing}
                                            progressViewOffset={insets.top + HEADER_HEIGHT + PROFILE_HEIGHT + TAB_HEIGHT}
                                            tintColor={'transparent'}
                                        />
                                    }
                                >
                                    {/* Demo content */}
                                    {Array(20).fill(0).map((_, i) => (
                                        <View key={i} style={styles.contentItem}>
                                            <Text style={styles.contentText}>Media item {i + 1}</Text>
                                        </View>
                                    ))}
                                </ScrollView>

                                {/* Reposts tab content */}
                                <ScrollView
                                    style={styles.page}
                                    scrollEventThrottle={16}
                                    onScroll={handleVerticalScroll}
                                    showsVerticalScrollIndicator={false}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing}
                                            progressViewOffset={insets.top + HEADER_HEIGHT + PROFILE_HEIGHT + TAB_HEIGHT}
                                            tintColor={'transparent'}
                                        />
                                    }
                                >
                                    {/* Demo content */}
                                    {Array(20).fill(0).map((_, i) => (
                                        <View key={i} style={styles.contentItem}>
                                            <Text style={styles.contentText}>Repost item {i + 1}</Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            </ScrollView>
                        </Animated.View>
                    </Animated.View>
                </View>
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    // Profile section styles

    profileCompletion: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    profileCompletionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    profileCompletionCount: {
        fontSize: 14,
        color: '#000',
        fontWeight: '400'
    },
    actionCards: {
    },
    actionCard: {
        width: 230,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
    },
    actionIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 35,
        borderColor: '#F0F0F0',
        borderWidth: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 5,
        textAlign: 'center',
    },
    actionDescription: {
        fontSize: 12,
        color: '#b3b3b3',
        textAlign: 'center',
        marginBottom: 10,
    },
    actionButton: {
        backgroundColor: '#000',
        borderRadius: 10,
        paddingVertical: 8,
        alignItems: 'center',
        width: '100%'
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    mainContainer: {
        flex: 1,
        position: 'relative',
    },
    tabsOuterContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        zIndex: 10, // Lower than profile and header, higher than content
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: padding,
        position: 'relative',
    },
    tab: {
        width: tabWidth,
        alignItems: 'center',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    underline: {
        position: 'absolute',
        bottom: -1,
        left: 0,
        height: 1,
        backgroundColor: 'black',
    },
    contentWrapper: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    page: {
        width: screenWidth,
        padding: 15,
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
    animatedBackground: {
        flex: 1,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    backgroundOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "black",
    },
    notchCover: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        zIndex: 40, // Higher than all other components
    },
    cardsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 16, // Add padding that will be canceled out
        gap: 8, // This adds the 10px gap between items
    },
});

export default Profile;
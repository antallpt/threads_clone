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
    Image,
    TextInput,

} from 'react-native';
import React, { useRef, useState, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomHeader, { CustomHeaderRef } from '@/components/CustomHeader';
import { Feather, Ionicons, MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons';
import ThreadComposer, { ThreadComposerRef } from '@/components/ThreadComposer'; // Import the new component

const screenWidth = Dimensions.get('window').width;
const padding = 20;
const underlineWidth = screenWidth / 2 - padding;

const HEADER_HEIGHT = 60; // Estimated header height
const TAB_HEIGHT = 40;   // Estimated tab height

const Home = () => {
    const insets = useSafeAreaInsets();
    const headerRef = useRef<CustomHeaderRef>(null);
    const threadComposerRef = useRef<ThreadComposerRef>(null); // Add ref for the thread composer
    const mainScaleValue = useRef(new Animated.Value(1)).current; // Animated value for scaling the main view
    const scrollX = useRef(new Animated.Value(0)).current;
    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef<ScrollView>(null);
    const [refreshing, setRefreshing] = useState(false);


    const setTouchActive = useCallback((isActive: boolean) => {
        headerRef.current?.setTouchActive(isActive);
    }, []);

    // Header fade and translate animation
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_HEIGHT / 2],
        outputRange: [1, 0],
        extrapolate: 'clamp'
    });

    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, HEADER_HEIGHT],
        outputRange: [0, -HEADER_HEIGHT - insets.top],
        extrapolate: 'clamp'
    });

    // Tab underline animation
    const translateX = scrollX.interpolate({
        inputRange: [0, screenWidth],
        outputRange: [padding, screenWidth / 2],
    });

    // Tab text color animation
    const activeTab = scrollX.interpolate({
        inputRange: [0, screenWidth],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    // Switch tabs on tap
    const switchTab = (index: number) => {
        scrollViewRef.current?.scrollTo({ x: index * screenWidth, animated: true });
    };

    // Handle refresh
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        headerRef.current?.startRefresh();
        setTimeout(() => setRefreshing(false), 2000);
    }, []);

    // Open thread composer
    const openThreadComposer = useCallback(() => {
        threadComposerRef.current?.openSheet();
    }, []);

    // Handle post submission
    const handlePostSubmit = useCallback((postText: string) => {
        console.log('Post submitted from Home:', postText);
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

    return (
        <Animated.View
            style={[
                styles.backgroundOverlay,
            ]}

        >
            <Animated.View
                style={[
                    styles.animatedBackground,
                    {
                        transform: [{ scale: mainScaleValue }],
                    },
                ]}
            >
                <View style={styles.container}>
                    <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

                    <ThreadComposer
                        ref={threadComposerRef}
                        onPostSubmit={handlePostSubmit}
                        mainScaleValue={mainScaleValue}
                    />

                    {/* Header that fades out when scrolling */}
                    <Animated.View
                        style={[
                            styles.headerContainer,
                            {
                                paddingTop: insets.top,
                                height: HEADER_HEIGHT + insets.top,
                                transform: [{ translateY: headerTranslateY }],
                                opacity: headerOpacity
                            }
                        ]}
                    >
                        <CustomHeader ref={headerRef} scrollY={scrollY} />
                    </Animated.View>

                    {/* Main content container that fills the screen */}
                    <Animated.View style={styles.mainContainer}>
                        {/* Tab header that moves with scrolling */}
                        <Animated.View
                            style={[
                                styles.tabsOuterContainer,
                                {
                                    transform: [{
                                        translateY: scrollY.interpolate({
                                            inputRange: [0, HEADER_HEIGHT],
                                            outputRange: [insets.top + HEADER_HEIGHT, insets.top],
                                            extrapolate: 'clamp'
                                        })
                                    }]
                                }
                            ]}
                        >
                            <View style={styles.tabsContainer}>
                                <TouchableOpacity onPress={() => switchTab(0)} style={styles.tab}>
                                    <Animated.Text
                                        style={[
                                            styles.tabText,
                                            {
                                                color: activeTab.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['#000', '#aaa'],
                                                }),
                                            },
                                        ]}
                                    >
                                        For You
                                    </Animated.Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => switchTab(1)} style={styles.tab}>
                                    <Animated.Text
                                        style={[
                                            styles.tabText,
                                            {
                                                color: activeTab.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['#aaa', '#000'],
                                                }),
                                            },
                                        ]}
                                    >
                                        Following
                                    </Animated.Text>
                                </TouchableOpacity>

                                {/* Animated underline */}
                                <Animated.View style={[
                                    styles.underline,
                                    {
                                        width: underlineWidth,
                                        transform: [{ translateX }]
                                    }
                                ]} />
                            </View>
                        </Animated.View>

                        {/* Content that adjusts its spacing based on scroll position */}
                        <Animated.View
                            style={[
                                styles.contentWrapper,
                                {
                                    // This is key: dynamically adjust padding based on scroll
                                    paddingTop: scrollY.interpolate({
                                        inputRange: [0, HEADER_HEIGHT],
                                        outputRange: [insets.top + HEADER_HEIGHT + TAB_HEIGHT, insets.top + TAB_HEIGHT],
                                        extrapolate: 'clamp'
                                    })
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
                                {/* "For You" tab content */}
                                <ScrollView
                                    style={styles.page}
                                    scrollEventThrottle={16}
                                    onScroll={handleVerticalScroll}
                                    onScrollBeginDrag={() => setTouchActive(true)}
                                    onScrollEndDrag={() => setTouchActive(false)}
                                    showsVerticalScrollIndicator={false}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing}
                                            onRefresh={onRefresh}
                                            progressViewOffset={60}
                                            tintColor={'transparent'}

                                        />
                                    }
                                >
                                    <TouchableOpacity onPress={openThreadComposer}>
                                        <View style={styles.inputContainer}>
                                            <View style={{ flexDirection: 'row', gap: 13 }}>
                                                <View style={{
                                                    flexDirection: 'column',
                                                    gap: 3,
                                                    alignItems: 'center',
                                                    width: 34
                                                }}>
                                                    <Image source={require('@/assets/images/profile.png')} style={styles.img} resizeMode='contain' />
                                                    {/* Use Animated.View with smooth transitions */}
                                                </View>

                                                <View style={styles.textContainer}>
                                                    <Text style={{ fontSize: 16, fontWeight: '500' }}>antal.lpt</Text>

                                                    <Text style={styles.textInput} maxFontSizeMultiplier={1.2}>

                                                        What's new?
                                                    </Text>

                                                    {/* Icons with smooth animation */}
                                                    <View
                                                        style={[
                                                            styles.iconsContainer,
                                                        ]}
                                                        pointerEvents="none"
                                                    >
                                                        <Ionicons name='images-outline' size={22} color={'#a0a0a0'} />
                                                        <Ionicons name='camera-outline' size={25} color={'#a0a0a0'} />
                                                        <MaterialCommunityIcons name='file-gif-box' size={27} color={'#a0a0a0'} />
                                                        <SimpleLineIcons name='microphone' size={21} color={'#a0a0a0'} />
                                                        <Feather name='hash' size={22} color={'#a0a0a0'} />
                                                        <Feather name='bar-chart-2' size={24} color={'#a0a0a0'} />
                                                        <SimpleLineIcons name='location-pin' size={21} color={'#a0a0a0'} />
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                    {/* Demo content */}
                                    {Array(20).fill(0).map((_, i) => (
                                        <View key={i} style={styles.contentItem}>
                                            <Text style={styles.contentText}>Content item {i + 1}</Text>
                                        </View>
                                    ))}
                                </ScrollView>

                                {/* "Following" tab content */}
                                <ScrollView
                                    style={styles.page}
                                    scrollEventThrottle={16}
                                    onScroll={handleVerticalScroll}
                                    onScrollBeginDrag={() => setTouchActive(true)}
                                    onScrollEndDrag={() => setTouchActive(false)}
                                    showsVerticalScrollIndicator={false}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing}
                                            onRefresh={onRefresh}
                                            progressViewOffset={60}
                                            tintColor={'transparent'}
                                        />
                                    }
                                >
                                    {/* Demo content */}
                                    {Array(20).fill(0).map((_, i) => (
                                        <View key={i} style={styles.contentItem}>
                                            <Text style={styles.contentText}>Following item {i + 1}</Text>
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
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        zIndex: 10,
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
        zIndex: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: padding,
        position: 'relative',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        paddingVertical: 2,
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
        marginBottom: 80
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
    inputContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 7
    },
    textInput: {
        fontSize: 16,
        fontWeight: '400',
        color: '#a0a0a0'
    },
    textContainer: {
        flex: 1,
        alignItems: 'flex-start',
        position: 'relative',
        gap: 5,
    },
    iconsContainer: {
        flexDirection: 'row',
        gap: 20,
        alignItems: 'center',
        paddingVertical: 10,
        left: 0,
        pointerEvents: 'auto',
        paddingBottom: 15
    },
    img: {
        width: 34,
        height: 34,
        borderRadius: 17
    },
    animatedBackground: {
        flex: 1,
        overflow: 'hidden',
        backgroundColor: '#fff',
        borderRadius: 20,
    },
    backgroundOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "black",
    },
});

export default Home;
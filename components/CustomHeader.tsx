import {
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    Animated,
    Easing,
    Text,
    Dimensions
} from 'react-native';
import React, { useRef, useState, useEffect, forwardRef } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter, useSegments } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { Entypo } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics'; // Import Haptics API

const screenWidth = Dimensions.get('window').width;
// Increased pull threshold - user needs to pull down further to trigger refresh
const PULL_THRESHOLD = 150;

export interface CustomHeaderRef {
    startRefresh: () => void;
    setTouchActive: (isActive: boolean) => void; // Add this method
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedImage = Animated.createAnimatedComponent(Image);

const CustomHeader = forwardRef<CustomHeaderRef, { scrollY?: Animated.Value }>((props, ref) => {
    // Props, auth, routing
    const { scrollY = new Animated.Value(0) } = props;
    const { isSignedIn } = useAuth();
    const router = useRouter();
    const segments = useSegments();
    const isTouchActive = useRef(false);


    // State declarations - declare all state first
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showBackButton, setShowBackButton] = useState(false);

    // Animation refs
    const rotationAnim = useRef(new Animated.Value(0)).current;
    const strokeDashoffsetAnim = useRef(new Animated.Value(66)).current;
    const pullAnim = useRef(new Animated.Value(0)).current;
    const logoOpacity = useRef(new Animated.Value(1)).current;
    const circleOpacity = useRef(new Animated.Value(0)).current;

    // Haptic feedback refs - after isRefreshing declaration
    const refreshing = useRef(false);  // Track refresh state for haptics
    const lastScrollY = useRef(0);
    const lastHapticY = useRef(0);
    const lastHapticTime = useRef(0);
    const currentSpacing = useRef(3);  // Very small spacing for very fast feedback

    // Effects - after all state declarations
    useEffect(() => {
        setShowBackButton(segments[segments.length - 1] !== "home2");
    }, [segments]);

    // Effect to sync the React state with our ref
    useEffect(() => {
        refreshing.current = isRefreshing;
    }, [isRefreshing]);

    // Modified interpolation for logo scaling with slower movement
    // We're extending the inputRange to make the logo move more slowly
    // (larger numbers in inputRange make the animation happen over a greater scroll distance)
    const scaleLogo = scrollY.interpolate({
        inputRange: [-PULL_THRESHOLD, -PULL_THRESHOLD / 2, 0, 50], // Added an extra point at 50
        outputRange: [1.4, 1.2, 1, 1], // Logo grows when pulled down but stays normal size when scrolling down
        extrapolate: 'clamp',
    });

    // Removed logoTranslateY since we don't want the logo to move down

    const rotation = rotationAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const triggerHapticFeedback = (currentY: number) => {
        // Skip haptic processing if refreshing or touch not active
        if (refreshing.current || !isTouchActive.current) {
            return;
        }

        // Only do haptic feedback when pulling down and not past threshold
        if (currentY < 0 && Math.abs(currentY) < PULL_THRESHOLD) {
            // Use constant spacing for rapid feedback (smaller value = faster feedback)
            const constantSpacing = 7; // Very small fixed value for rapid constant feedback

            // Check if we've crossed a "dot" boundary
            const distanceSinceLastHaptic = Math.abs(currentY - lastHapticY.current);

            if (distanceSinceLastHaptic >= constantSpacing) {
                // Trigger haptic
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);

                // Update the position of our last haptic "dot"
                const stepsToMove = Math.floor(distanceSinceLastHaptic / constantSpacing);
                lastHapticY.current = lastHapticY.current - (stepsToMove * constantSpacing);
            }
        }
        // Threshold crossing haptic
        else if (currentY < 0 && Math.abs(currentY) >= PULL_THRESHOLD &&
            Math.abs(lastScrollY.current) < PULL_THRESHOLD) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }

        // Update last scroll position
        lastScrollY.current = currentY;
    };

    useEffect(() => {
        const listenerId = scrollY.addListener(({ value }) => {
            pullAnim.setValue(value);

            // Handle haptic feedback based on scroll
            triggerHapticFeedback(value);

            // Always reset haptic tracking when scrolling returns to zero or positive
            if (value >= 0) {
                lastHapticY.current = 0;
            }

            // Trigger refresh when threshold is reached
            if (value <= 0 && Math.abs(value) >= PULL_THRESHOLD && !isRefreshing) {
                triggerRefresh();
            }
        });

        return () => {
            scrollY.removeListener(listenerId);
        };
    }, [isRefreshing, scrollY]);

    // Expose startRefresh method via ref
    React.useImperativeHandle(ref, () => ({
        startRefresh: triggerRefresh,
        setTouchActive: (isActive: boolean) => {
            isTouchActive.current = isActive;
            if (!isActive) {
                // Reset haptic tracking when touch ends
                lastHapticY.current = 0;
            }
        }
    }));

    const triggerRefresh = () => {
        if (isRefreshing) return;
        setIsRefreshing(true);

        // Update our ref immediately (don't wait for the effect)
        refreshing.current = true;

        // Custom haptic for refresh trigger (avoiding notification patterns)
        // Use two sequential heavy impacts instead of a notification
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        // Reset animation values
        strokeDashoffsetAnim.setValue(66);

        // Simple, reliable animation sequence
        // 1. First hide logo and show circle
        logoOpacity.setValue(0);
        circleOpacity.setValue(1);

        // 2. Start rotation animation
        const rotationAnimation = Animated.loop(
            Animated.timing(rotationAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        rotationAnimation.start();

        // 3. Start stroke animation
        Animated.timing(strokeDashoffsetAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
        }).start();

        // 4. Set timeout to stop animation and begin transition
        setTimeout(() => {
            // Stop rotation
            rotationAnimation.stop();
            rotationAnim.setValue(0);

            // Smooth transition animations
            // First fade out the circle
            Animated.timing(circleOpacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start();

            // Slightly delay the logo fade-in for a cleaner transition
            setTimeout(() => {
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 350,
                    useNativeDriver: true,
                }).start(() => {
                    // Reset haptic state when animation completes
                    lastHapticY.current = 0;
                    lastScrollY.current = 0;
                    lastHapticTime.current = 0;
                    currentSpacing.current = 3; // Reset to minimum spacing for fastest feedback
                    refreshing.current = false;

                    // Reset React state when animation completes
                    setIsRefreshing(false);
                });
            }, 100);

        }, 2200);
    };

    return (
        <View style={styles.container}>
            {/* Back Button */}
            {!isSignedIn && showBackButton && (
                <TouchableOpacity
                    onPress={() => router.replace('/(public)/(tabs)/home2')}
                    style={styles.backButton}
                >
                    <Entypo name="chevron-thin-left" size={25} color={'#000'} />
                </TouchableOpacity>
            )}

            {/* Logo and refresh animation container */}
            <Animated.View
                style={styles.centeredLogoContainer}
            >
                <Animated.View
                    style={[
                        styles.svgContainer,
                        {
                            transform: [
                                { scale: scaleLogo }
                                // Removed translateY transform
                            ]
                        }
                    ]}
                >
                    {/* Animated circle container */}
                    <Animated.View
                        style={[
                            styles.overlayContainer,
                            { opacity: circleOpacity }
                        ]}
                        pointerEvents="none"
                    >
                        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                            <Svg height="30" width="30" viewBox="0 0 30 30">
                                <AnimatedCircle
                                    cx="15"
                                    cy="15"
                                    r="10"
                                    stroke="black"
                                    strokeWidth={1.8}
                                    fill="transparent"
                                    strokeLinecap="round"
                                    strokeDasharray={66}
                                    strokeDashoffset={strokeDashoffsetAnim}
                                />
                            </Svg>
                        </Animated.View>
                    </Animated.View>

                    {/* Logo container */}
                    <AnimatedImage
                        source={require('../assets/images/threadslogo.png')}
                        style={[styles.logoImage, { opacity: logoOpacity }]}
                        resizeMode="contain"
                    />
                </Animated.View>
            </Animated.View>

            {/* Log In Button */}
            {!isSignedIn && (
                <TouchableOpacity onPress={() => router.replace('/')} style={styles.loginButton}>
                    <Text style={styles.loginText}>Log In</Text>
                </TouchableOpacity>
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '100%',
        height: 60,
        paddingHorizontal: 20,
        backgroundColor: 'transparent', // Changed to transparent
    },
    backButton: {
        position: 'absolute',
        left: 10,
        zIndex: 10,
    },
    centeredLogoContainer: {
        position: 'absolute',
        left: screenWidth / 2,
        transform: [{ translateX: -15 }],
        zIndex: 5,
    },
    svgContainer: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayContainer: {
        position: 'absolute',
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoImage: {
        width: 35,
        height: 35,
    },
    loginButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderColor: '#b3b3b3',
        borderRadius: 30,
        borderWidth: StyleSheet.hairlineWidth,
    },
    loginText: {
        fontSize: 15,
        fontWeight: '500',
    },
});

export default CustomHeader;
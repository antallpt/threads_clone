import React, { useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Pressable, Text, Image } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

// Create animated components
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedImage = Animated.createAnimatedComponent(Image);

const ThreadsRefreshAnimation = () => {
    // Animation states
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    // Animation values
    const rotationAnim = useRef(new Animated.Value(0)).current;
    const logoAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const strokeDashoffsetAnim = useRef(new Animated.Value(66)).current; // Circumference of circle

    // Convert animation values to interpolated styles
    const rotation = rotationAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const logoOpacity = logoAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0, 1],
    });

    const circleOpacity = logoAnim.interpolate({
        inputRange: [0, 0.3, 1],
        outputRange: [1, 0, 0],
    });

    // Start refresh animation
    const startRefresh = () => {
        // Reset states
        setIsRefreshing(true);
        setIsCompleted(false);
        logoAnim.setValue(0);
        strokeDashoffsetAnim.setValue(66); // Reset circle progress

        // Start rotating circle
        Animated.loop(
            Animated.timing(rotationAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Animate progress to complete state (circle drawing)
        Animated.timing(strokeDashoffsetAnim, {
            toValue: 0,
            duration: 2000, // Simulated loading time
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
        }).start(() => {
            // Stop rotation animation
            rotationAnim.stopAnimation();

            // Show completion animation with Threads logo
            Animated.sequence([
                Animated.timing(logoAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1.2,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                })
            ]).start(() => {
                setIsRefreshing(false);
                setIsCompleted(true);

                // Reset after a delay
                setTimeout(() => {
                    setIsCompleted(false);
                }, 1500);
            });
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.animationContainer}>
                <Animated.View
                    style={[
                        styles.svgContainer,
                        {
                            transform: [
                                { rotate: isRefreshing && !isCompleted ? rotation : '0deg' },
                                { scale: scaleAnim }
                            ]
                        }
                    ]}
                >
                    {/* Container für das Logo und den Ladekreis */}
                    <View style={styles.overlayContainer}>
                        {/* Progress circle */}
                        <Svg height="30" width="30" viewBox="0 0 30 30">
                            <AnimatedCircle
                                cx="15"
                                cy="15"
                                r="10"
                                stroke="black"
                                strokeWidth={2.5}
                                fill="transparent"
                                strokeLinecap="round"
                                opacity={circleOpacity}
                                strokeDasharray={66} // 2 * PI * r (circumference)
                                strokeDashoffset={strokeDashoffsetAnim}
                            />
                        </Svg>

                        {/* Eigenes Threads Logo (als Bild) */}
                        <AnimatedImage
                            source={require('../../../assets/images/threadslogo.png')} // Passe den Pfad zu deinem Logo an
                            style={[
                                styles.logoImage,
                                { opacity: logoOpacity }
                            ]}
                            resizeMode="contain"
                        />
                    </View>
                </Animated.View>
            </View>

            <Pressable
                style={styles.button}
                onPress={startRefresh}
                disabled={isRefreshing}
            >
                <Text style={styles.buttonText}>
                    {isRefreshing ? 'Loading...' : isCompleted ? 'Refreshed!' : 'Refresh'}
                </Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    animationContainer: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    svgContainer: {
        width: 30,
        height: 30,
    },
    overlayContainer: {
        position: 'absolute',
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoImage: {
        position: 'absolute',
        width: 20,
        height: 20,
    },
    button: {
        backgroundColor: '#000',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    }
});

export default ThreadsRefreshAnimation;
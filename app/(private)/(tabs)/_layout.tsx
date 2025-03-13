import {
    View,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Text,
    StatusBar // Import StatusBar
} from 'react-native';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Tabs } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetView,
    BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';

const Layout = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = ["90%"]; // Nur eine Höhe (90%)

    // Hintergrund-Animation
    const backgroundAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (modalVisible) {
            // Change status bar to light mode when modal is open
            StatusBar.setBarStyle('light-content', true);

            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 0.89,
                    duration: 300, // Kürzere Dauer für bessere Reaktion
                    useNativeDriver: true,
                }),
                Animated.timing(backgroundAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Change status bar back to dark mode when modal is closed
            StatusBar.setBarStyle('dark-content', true);

            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(backgroundAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [modalVisible]);

    // Sheet öffnen
    const openSheet = useCallback(() => {
        setModalVisible(true);
        bottomSheetRef.current?.present();
    }, []);

    // Sheet sofort schließen (schnelle Reaktion)
    const closeSheet = useCallback(() => {
        setModalVisible(false); // 🟢 Sofort zurücksetzen, damit Scale-Anim nicht verzögert wird
        bottomSheetRef.current?.dismiss();
    }, []);

    return (
        <BottomSheetModalProvider>
            {/* Initially set status bar to dark content */}
            <StatusBar barStyle="dark-content" />

            {/* Hintergrund mit animierter Opacity */}
            <Animated.View
                style={[
                    styles.backgroundOverlay,
                    { opacity: backgroundAnim }
                ]}
            />

            {/* Main Content */}
            <Animated.View
                style={[
                    styles.animatedBackground,
                    {
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <Tabs
                    screenOptions={{
                        tabBarActiveTintColor: '#000',
                        tabBarStyle: {
                            backgroundColor: '#fff',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            borderTopWidth: 0,
                            elevation: 0,
                            paddingTop: 10,
                        },
                    }}
                >
                    <Tabs.Screen
                        name="home"
                        options={{
                            title: '',
                            tabBarIcon: ({ size, color, focused }) => (
                                <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
                            ),
                            headerShown: false
                        }}
                    />
                    <Tabs.Screen
                        name="search"
                        options={{
                            title: '',
                            tabBarIcon: ({ size, color, focused }) => (
                                <Ionicons name={focused ? 'search' : 'search-outline'} size={size} color={color} />
                            ),
                            headerShown: false
                        }}
                    />

                    <Tabs.Screen
                        name="create"
                        options={{
                            title: '',
                            tabBarIcon: ({ size }) => (
                                <TouchableOpacity onPress={openSheet} activeOpacity={1}>
                                    <View style={styles.createButton}>
                                        <Feather name="plus" size={25} color={'#b0b0b0'} />
                                    </View>
                                </TouchableOpacity>
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name="activity"
                        options={{
                            title: '',
                            tabBarIcon: ({ size, color, focused }) => (
                                <Ionicons name={focused ? 'heart' : 'heart-outline'} size={size} color={color} />
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name="profile"
                        options={{
                            title: '',
                            tabBarIcon: ({ size, color, focused }) => (
                                <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
                            ),
                        }}
                    />
                </Tabs>
            </Animated.View>

            {/* Bottom Sheet Modal */}
            <BottomSheetModal
                ref={bottomSheetRef}
                index={0} // Öffnet direkt auf 90%
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                onDismiss={closeSheet} // Schließt bei Swipe oder Klick außerhalb
                handleComponent={null} // Kein Indikator anzeigen
                enableDynamicSizing={false}
                backdropComponent={(props) => (
                    <BottomSheetBackdrop
                        {...props}
                        disappearsOnIndex={-1}
                        appearsOnIndex={0}
                        opacity={0.4} // 🔥 Sofortige Transparenz für smoothen Effekt
                        pressBehavior="close" // Schließt bei Klick auf den Hintergrund
                    />
                )}
            >
                <BottomSheetView style={styles.sheetContent}>
                    <Text style={styles.sheetTitle}>Create a Post</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={closeSheet}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </BottomSheetView>
            </BottomSheetModal>
        </BottomSheetModalProvider>
    );
};

const styles = StyleSheet.create({
    backgroundOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "black",
    },
    animatedBackground: {
        flex: 1,
        overflow: 'hidden',
        backgroundColor: '#fff',
        borderRadius: 20,
    },
    createButton: {
        width: 46,
        height: 39,
        borderRadius: 10,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sheetContent: {
        padding: 20,
        alignItems: 'center',
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        marginTop: 20,
        alignSelf: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default Layout;
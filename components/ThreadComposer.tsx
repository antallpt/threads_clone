import {
    View,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Text,
    StatusBar,
    Image,
    TextInput,
    NativeSyntheticEvent,
    TextInputContentSizeChangeEventData,
    Keyboard,
    Platform,
    Easing
} from 'react-native';
import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Feather, Ionicons, MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetView,
} from '@gorhom/bottom-sheet';

// Define the ref type for external access
export type ThreadComposerRef = {
    openSheet: () => void;
    closeSheet: () => void;
};

// Props including a scale value that we can animate
type ThreadComposerProps = {
    onPostSubmit?: (postText: string) => void;
    // We'll pass an Animated.Value for the scale instead of a view ref
    mainScaleValue?: Animated.Value;
};

const ThreadComposer = forwardRef<ThreadComposerRef, ThreadComposerProps>(
    ({ onPostSubmit, mainScaleValue }, ref) => {
        const [modalVisible, setModalVisible] = useState(false);
        const [postText, setPostText] = useState('');
        const [keyboardHeight, setKeyboardHeight] = useState(0);
        const [keyboardVisible, setKeyboardVisible] = useState(false);
        const bottomSheetRef = useRef<BottomSheetModal>(null);
        const snapPoints = ["93%"];

        // Animation values with improved defaults
        const backgroundAnim = useRef(new Animated.Value(0)).current;
        const scaleAnim = useRef(new Animated.Value(1)).current;
        const lineHeightAnim = useRef(new Animated.Value(22)).current;
        const iconsTopAnim = useRef(new Animated.Value(20)).current;

        // Keyboard accessory animations - initialize with 0
        const accessoryPositionAnim = useRef(new Animated.Value(0)).current;
        const accessoryOpacityAnim = useRef(new Animated.Value(0)).current;

        const textInputRef = useRef<TextInput>(null);
        const [inputHeight, setInputHeight] = useState(0);

        // Expose methods to parent via ref
        useImperativeHandle(ref, () => ({
            openSheet,
            closeSheet
        }));

        // Keyboard event listeners with improved animations
        useEffect(() => {
            // Create listeners for keyboard show/hide events
            const keyboardWillShowListener = Keyboard.addListener(
                Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
                (event) => {
                    const kbHeight = event.endCoordinates.height;
                    setKeyboardVisible(true);
                    setKeyboardHeight(kbHeight);

                    // Animate position and opacity for smooth appearance
                    if (modalVisible) {
                        Animated.parallel([
                            Animated.timing(accessoryPositionAnim, {
                                toValue: kbHeight,
                                duration: Platform.OS === 'ios' ? 280 : 200,
                                easing: Easing.bezier(0.2, 0.6, 0.4, 1), // Smooth easing
                                useNativeDriver: false
                            }),
                            Animated.timing(accessoryOpacityAnim, {
                                toValue: 1,
                                duration: Platform.OS === 'ios' ? 200 : 150,
                                easing: Easing.ease,
                                useNativeDriver: false,
                                delay: Platform.OS === 'ios' ? 50 : 20 // Small delay to match keyboard
                            })
                        ]).start();
                    }
                }
            );

            const keyboardWillHideListener = Keyboard.addListener(
                Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
                () => {
                    setKeyboardVisible(false);

                    // Animate back to hidden state
                    if (modalVisible) {
                        Animated.parallel([
                            Animated.timing(accessoryPositionAnim, {
                                toValue: 0,
                                duration: Platform.OS === 'ios' ? 280 : 200,
                                easing: Easing.bezier(0.2, 0.6, 0.4, 1),
                                useNativeDriver: false
                            }),
                            Animated.timing(accessoryOpacityAnim, {
                                toValue: 0,
                                duration: 150,
                                easing: Easing.ease,
                                useNativeDriver: false
                            })
                        ]).start(() => setKeyboardHeight(0));
                    }
                }
            );

            // Clean up listeners
            return () => {
                keyboardWillShowListener.remove();
                keyboardWillHideListener.remove();
            };
        }, [modalVisible]); // Add modalVisible as a dependency

        // Reset animation values when modal closes
        useEffect(() => {
            if (!modalVisible) {
                accessoryOpacityAnim.setValue(0);
                accessoryPositionAnim.setValue(0);
            }
        }, [modalVisible]);

        // Post handler
        const handlePost = useCallback(() => {
            if (onPostSubmit) {
                onPostSubmit(postText);
            } else {
                console.log('Posting:', postText);
            }
            setPostText('');
            closeSheet();
        }, [postText, onPostSubmit]);

        // Auto-focus when modal opens
        useEffect(() => {
            if (modalVisible) {
                const timer = setTimeout(() => {
                    if (textInputRef.current) {
                        textInputRef.current.focus();
                    }
                }, 500);

                return () => clearTimeout(timer);
            }
        }, [modalVisible]);

        // Content size change handler
        const onContentSizeChange = (event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
            const { height } = event.nativeEvent.contentSize;
            const newLineHeight = Math.max(22, height + 15);
            const iconPosition = newLineHeight - 2;

            Animated.parallel([
                Animated.spring(lineHeightAnim, {
                    toValue: newLineHeight,
                    friction: 7,
                    tension: 40,
                    useNativeDriver: false
                }),
                Animated.spring(iconsTopAnim, {
                    toValue: iconPosition,
                    friction: 7,
                    tension: 40,
                    useNativeDriver: false
                })
            ]).start();

            setInputHeight(height);
        };

        // Modal visibility effect with external view scaling
        useEffect(() => {
            if (modalVisible) {
                StatusBar.setBarStyle('light-content', true);

                // Use Animated.parallel for smoother animations
                Animated.parallel([
                    // Animate background overlay
                    Animated.timing(backgroundAnim, {
                        toValue: 0.5, // Reduced opacity for less darkness
                        duration: 300,
                        useNativeDriver: true,
                    }),

                    // Animate the external scale if provided
                    ...(mainScaleValue ? [
                        Animated.timing(mainScaleValue, {
                            toValue: 0.88,
                            duration: 300,
                            useNativeDriver: true,
                        })
                    ] : []),

                    // Scale our internal animation value
                    Animated.timing(scaleAnim, {
                        toValue: 0.88,
                        duration: 300,
                        useNativeDriver: true,
                    })
                ]).start();
            } else {
                StatusBar.setBarStyle('dark-content', true);

                // Use Animated.parallel for smoother animations
                Animated.parallel([
                    // Animate background overlay
                    Animated.timing(backgroundAnim, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }),

                    // Reset the external scale if provided
                    ...(mainScaleValue ? [
                        Animated.timing(mainScaleValue, {
                            toValue: 1,
                            duration: 200,
                            useNativeDriver: true,
                        })
                    ] : []),

                    // Reset internal scale
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: true,
                    })
                ]).start();
            }
        }, [modalVisible, mainScaleValue]);

        // Function to open the bottom sheet
        const openSheet = useCallback(() => {
            setModalVisible(true);
            // Present the bottom sheet immediately
            bottomSheetRef.current?.present();
        }, []);

        // Function to close the bottom sheet
        const closeSheet = useCallback(() => {
            Keyboard.dismiss();
            bottomSheetRef.current?.dismiss();

            // Set a slight delay before hiding the modal to ensure animations complete
            setTimeout(() => {
                setModalVisible(false);
            }, 100);
        }, []);

        return (
            <>
                {/* Only render the background overlay when modal is visible */}
                {modalVisible && (
                    <Animated.View
                        style={[
                            styles.backgroundOverlay,
                            { opacity: backgroundAnim }
                        ]}
                    />
                )}

                <BottomSheetModal
                    ref={bottomSheetRef}
                    index={0}
                    snapPoints={snapPoints}
                    enablePanDownToClose={true}
                    overDragResistanceFactor={0.1}
                    onDismiss={() => {
                        // Ensure modal is set to false on dismiss
                        setModalVisible(false);
                        Keyboard.dismiss();
                    }}
                    handleComponent={null}
                    enableDynamicSizing={false}
                    keyboardBehavior="extend"
                    keyboardBlurBehavior="none"
                    android_keyboardInputMode="adjustResize"
                    backdropComponent={(props) => (
                        <BottomSheetBackdrop
                            {...props}
                            disappearsOnIndex={-1}
                            appearsOnIndex={0}
                            opacity={0.4}
                            pressBehavior="close"
                        />
                    )}
                >
                    <BottomSheetView style={styles.sheetContent}>
                        {/* The keyboard accessory bar */}
                        {modalVisible && (
                            <Animated.View
                                style={[
                                    styles.keyboardAccessory,
                                    {
                                        bottom: accessoryPositionAnim,
                                        opacity: accessoryOpacityAnim,
                                        zIndex: 10000, // Ensure this is at the very top
                                    }
                                ]}
                                pointerEvents={keyboardVisible ? 'auto' : 'none'}
                            >
                                <Text style={styles.accessoryText}>Your followers can reply and quote</Text>
                                <TouchableOpacity
                                    style={[
                                        styles.postButton,
                                        postText.trim() === '' ? styles.postButtonDisabled : null
                                    ]}
                                    onPress={handlePost}
                                    disabled={postText.trim() === ''}
                                >
                                    <Text style={[
                                        styles.postButtonText,
                                        postText.trim() === '' ? styles.postButtonTextDisabled : null
                                    ]}>Post</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}
                        <View style={styles.createHeader}>
                            <TouchableOpacity style={[styles.closeButton, { zIndex: 10 }]} onPress={closeSheet}>
                                <Text style={styles.closeButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={styles.sheetTitle}>New thread</Text>
                            <View style={styles.headerButton}>
                                <MaterialCommunityIcons name='sticker-text-outline' size={23} color='#000' />
                                <Ionicons name='ellipsis-horizontal-circle-outline' size={23} color='#000' />
                            </View>
                        </View>
                        <View style={styles.separator} />

                        <View style={styles.inputContainer}>
                            <View style={{ flexDirection: 'row', gap: 13 }}>
                                <View style={{
                                    flexDirection: 'column',
                                    gap: 3,
                                    alignItems: 'center',
                                    width: 34
                                }}>
                                    <Image source={require('@/assets/images/profile.png')} style={styles.img} resizeMode='contain' />
                                    <Animated.View style={[styles.separator2, { height: lineHeightAnim }]} />
                                </View>

                                <View style={styles.textContainer}>
                                    <Text style={{ fontSize: 13, fontWeight: '400' }}>antal.lpt</Text>

                                    <TextInput
                                        ref={textInputRef}
                                        placeholder="What's new?"
                                        style={styles.textInput}
                                        multiline={true}
                                        placeholderTextColor={'#a0a0a0'}
                                        onContentSizeChange={onContentSizeChange}
                                        value={postText}
                                        onChangeText={setPostText}
                                    />

                                    <Animated.View
                                        style={[
                                            styles.iconsContainer,
                                            { top: iconsTopAnim }
                                        ]}
                                    >
                                        <Ionicons name='images-outline' size={20} color={'#a0a0a0'} />
                                        <Ionicons name='camera-outline' size={23} color={'#a0a0a0'} />
                                        <MaterialCommunityIcons name='file-gif-box' size={25} color={'#a0a0a0'} />
                                        <SimpleLineIcons name='microphone' size={19} color={'#a0a0a0'} />
                                        <Feather name='hash' size={20} color={'#a0a0a0'} />
                                        <Feather name='bar-chart-2' size={22} color={'#a0a0a0'} />
                                        <SimpleLineIcons name='location-pin' size={19} color={'#a0a0a0'} />
                                    </Animated.View>
                                </View>
                            </View>

                            <View style={styles.addThreadContainer}>
                                <View style={styles.addThreadLeftColumn}>
                                    <Image source={require('@/assets/images/profile.png')} style={styles.img2} resizeMode='contain' />
                                </View>

                                <View style={styles.addThreadTextContainer}>
                                    <TextInput
                                        placeholder="Add to thread"
                                        style={styles.addThreadTextInput}
                                        multiline={true}
                                        placeholderTextColor={'#a0a0a0'}
                                    />
                                </View>
                            </View>
                        </View>
                    </BottomSheetView>
                </BottomSheetModal>
            </>
        );
    }
);

const styles = StyleSheet.create({
    backgroundOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "black",
        zIndex: 100, // Lower than keyboard accessory but higher than content
    },
    sheetContent: {
        flexDirection: 'column',
        flex: 1,
    },
    sheetTitle: {
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 17,
        fontWeight: '600',
        zIndex: 1
    },
    closeButton: {
        alignSelf: 'center',
    },
    closeButtonText: {
        fontSize: 14,
        fontWeight: '400',
    },
    createHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16
    },
    headerButton: {
        flexDirection: 'row',
        gap: 10
    },
    separator: {
        height: 2,
        backgroundColor: '#f9f9f9',
        width: '100%',
    },
    separator2: {
        width: 1,
        backgroundColor: '#a0a0a0',
        flex: 0,
        alignSelf: 'center',
        opacity: 0.3,
        marginTop: 5
    },
    img: {
        width: 34,
        height: 34,
        borderRadius: 17
    },
    img2: {
        width: 18,
        height: 18,
        borderRadius: 9
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 16,
        gap: 7
    },
    textInput: {
        fontSize: 13,
        fontWeight: '300',
        paddingTop: 0,
        paddingBottom: 25,
        textAlignVertical: 'top',
        width: '100%'
    },
    textContainer: {
        flex: 1,
        paddingRight: 8,
        alignItems: 'flex-start',
        position: 'relative',
        gap: 5,
        minHeight: 100,
    },
    iconsContainer: {
        flexDirection: 'row',
        gap: 15,
        alignItems: 'center',
        paddingVertical: 2,
        position: 'absolute',
        left: 0,
        pointerEvents: 'auto'
    },
    addThreadContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: 13
    },
    addThreadLeftColumn: {
        width: 34,
        alignItems: 'center'
    },
    addThreadTextContainer: {
        flex: 1,
        paddingRight: 8,
        paddingTop: 1
    },
    addThreadTextInput: {
        fontSize: 13,
        fontWeight: '300',
        paddingTop: 0,
        paddingBottom: 8,
        textAlignVertical: 'top',
        width: '100%',
        color: '#a0a0a0'
    },

    // Improved keyboard accessory styles
    keyboardAccessory: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,

    },
    accessoryText: {
        fontSize: 13,
        color: '#8e8e8e',
    },
    postButton: {
        backgroundColor: '#000',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 25,
    },
    postButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 13,
    },
    postButtonDisabled: {
        backgroundColor: '#000', // Light gray background for disabled state
        opacity: 0.35
    },
    postButtonTextDisabled: {
        color: '#fff', // Light gray text for disabled state
    },
});

export default ThreadComposer;
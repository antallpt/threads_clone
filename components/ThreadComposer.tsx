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
    Easing,
    LayoutAnimation,
    UIManager
} from 'react-native';
import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Feather, Ionicons, MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetView,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
        const [addToPostText, setAddToPostText] = useState('');
        const [keyboardHeight, setKeyboardHeight] = useState(0);
        const [keyboardVisible, setKeyboardVisible] = useState(false);
        const [isDismissing, setIsDismissing] = useState(false);
        const bottomSheetRef = useRef<BottomSheetModal>(null);
        const scrollViewRef = useRef<any>(null);
        const snapPoints = ["93%"];

        // State for structural changes
        const [lineHeight, setLineHeight] = useState(22);
        // Set smaller initial height for the thread line
        const [threadLineHeight, setThreadLineHeight] = useState(10);

        // Animated values for main input
        const lineHeightAnim = useRef(new Animated.Value(22)).current;
        const iconsTopAnim = useRef(new Animated.Value(20)).current;

        // Animated values for "Add to thread" section with smaller initial value
        const threadLineHeightAnim = useRef(new Animated.Value(10)).current;

        // Background and scaling animations
        const backgroundAnim = useRef(new Animated.Value(0)).current;
        const scaleAnim = useRef(new Animated.Value(1)).current;

        // Keyboard accessory animations
        const accessoryPositionAnim = useRef(new Animated.Value(0)).current;
        const accessoryOpacityAnim = useRef(new Animated.Value(0)).current;

        // Animation state tracking
        const isAnimatingRef = useRef(false);
        const lastUpdateRef = useRef(0);
        const pendingUpdateRef = useRef<{ height: number, position: number } | null>(null);

        // Input refs 
        const textInputRef = useRef<TextInput>(null);
        const threadInputRef = useRef<TextInput>(null);

        // Height state
        const [inputHeight, setInputHeight] = useState(0);
        const [threadInputHeight, setThreadInputHeight] = useState(0);

        // Track input text without controlling the TextInput
        const currentTextRef = useRef('');
        const threadTextRef = useRef('');

        // Expose methods to parent via ref
        useImperativeHandle(ref, () => ({
            openSheet,
            closeSheet
        }));

        // Safe scroll to bottom function
        const scrollToBottom = useCallback(() => {
            try {
                if (scrollViewRef.current && modalVisible) {
                    requestAnimationFrame(() => {
                        scrollViewRef.current.scrollToEnd({
                            animated: true // Use animation for smoother scrolling
                        });
                    });
                }
            } catch (error) {
                // Silently ignore scroll errors
            }
        }, [modalVisible]);

        // Custom easing function for smoother animations
        const customEasing = Easing.bezier(0.25, 0.1, 0.25, 1);

        // Smooth animation for line height
        const animateLineHeight = useCallback((newHeight: number, newPosition: number, isThread = false) => {
            const now = Date.now();
            const MIN_UPDATE_INTERVAL = 200; // reduced from 300ms for quicker response

            if (isThread) {
                // For thread input, use simpler animation logic
                LayoutAnimation.configureNext({
                    duration: 250,
                    update: {
                        type: LayoutAnimation.Types.easeInEaseOut,
                        property: LayoutAnimation.Properties.scaleXY,
                    }
                });

                setThreadLineHeight(newHeight);

                Animated.timing(threadLineHeightAnim, {
                    toValue: newHeight,
                    duration: 350, // Longer for smoother feel
                    easing: customEasing,
                    useNativeDriver: false
                }).start();

                return;
            }

            // For main input with queue management
            if (isAnimatingRef.current) {
                pendingUpdateRef.current = { height: newHeight, position: newPosition };
                return;
            }

            // Throttle updates to prevent crashes but maintain responsiveness
            if (now - lastUpdateRef.current < MIN_UPDATE_INTERVAL) {
                if (!pendingUpdateRef.current) {
                    pendingUpdateRef.current = { height: newHeight, position: newPosition };

                    // Schedule update after throttle period
                    setTimeout(() => {
                        if (pendingUpdateRef.current) {
                            const { height, position } = pendingUpdateRef.current;
                            pendingUpdateRef.current = null;
                            animateLineHeight(height, position);
                        }
                    }, MIN_UPDATE_INTERVAL);
                }
                return;
            }

            // Update structural state
            setLineHeight(newHeight);

            // Mark that we're animating
            isAnimatingRef.current = true;
            lastUpdateRef.current = now;

            // Configure smooth layout animation
            LayoutAnimation.configureNext({
                duration: 250,
                update: {
                    type: LayoutAnimation.Types.easeInEaseOut,
                    property: LayoutAnimation.Properties.scaleXY,
                }
            });

            // Animate the visual properties with smoother easing
            Animated.parallel([
                Animated.timing(lineHeightAnim, {
                    toValue: newHeight,
                    duration: 350, // Longer duration for smoother animation
                    easing: customEasing,
                    useNativeDriver: false
                }),
                Animated.timing(iconsTopAnim, {
                    toValue: newPosition,
                    duration: 350,
                    easing: customEasing,
                    useNativeDriver: false
                })
            ]).start(({ finished }) => {
                isAnimatingRef.current = false;

                // Process pending update if exists
                if (pendingUpdateRef.current) {
                    const { height, position } = pendingUpdateRef.current;
                    pendingUpdateRef.current = null;

                    requestAnimationFrame(() => {
                        animateLineHeight(height, position);
                    });
                }
            });
        }, [customEasing]);

        // Keyboard event listeners
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
                                easing: Easing.bezier(0.2, 0.6, 0.4, 1),
                                useNativeDriver: false
                            }),
                            Animated.timing(accessoryOpacityAnim, {
                                toValue: 1,
                                duration: Platform.OS === 'ios' ? 200 : 150,
                                easing: Easing.ease,
                                useNativeDriver: false,
                                delay: Platform.OS === 'ios' ? 50 : 20
                            })
                        ]).start();

                        // Scroll to bottom after keyboard appears
                        setTimeout(scrollToBottom, 300);
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
        }, [modalVisible, scrollToBottom]);

        // Reset animation values when modal closes
        useEffect(() => {
            if (!modalVisible && !isDismissing) {
                // Reset animation values
                accessoryOpacityAnim.setValue(0);
                accessoryPositionAnim.setValue(0);
                lineHeightAnim.setValue(22);
                iconsTopAnim.setValue(20);
                threadLineHeightAnim.setValue(10); // Reset to smaller value

                // Reset state
                setPostText('');
                setAddToPostText('')
                currentTextRef.current = '';
                threadTextRef.current = '';
                setLineHeight(22);
                setThreadLineHeight(10); // Reset to smaller value

                // Reset animation tracking
                isAnimatingRef.current = false;
                lastUpdateRef.current = 0;
                pendingUpdateRef.current = null;

                // Clear TextInputs
                if (textInputRef.current) {
                    textInputRef.current.clear();
                }
                if (threadInputRef.current) {
                    threadInputRef.current.clear();
                }
            }
        }, [modalVisible, isDismissing]);

        // Post handler
        const handlePost = useCallback(() => {
            if (onPostSubmit) {
                onPostSubmit(currentTextRef.current);
            } else {
                console.log('Posting:', currentTextRef.current);
            }

            // Reset text and refs
            setPostText('');
            setAddToPostText('');
            currentTextRef.current = '';
            threadTextRef.current = '';

            // Clear the TextInput directly
            if (textInputRef.current) {
                textInputRef.current.clear();
            }
            if (threadInputRef.current) {
                threadInputRef.current.clear();
            }

            closeSheet();
        }, [onPostSubmit]);

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

        // Main content size change handler
        const onContentSizeChange = useCallback((event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
            try {
                const { height } = event.nativeEvent.contentSize;
                setInputHeight(height);

                // Calculate new values for the main input
                // Keep the padding for the main input as it seems intentional for design
                const newLineHeight = Math.max(22, height + 15);
                const newIconPosition = newLineHeight - 2;

                // Animate the changes
                animateLineHeight(newLineHeight, newIconPosition);

                // Always scroll to bottom
                scrollToBottom();
            } catch (error) {
                console.log('ContentSize error:', error);
            }
        }, [animateLineHeight, scrollToBottom]);

        // Thread input content size change handler 
        const onThreadContentSizeChange = useCallback((event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
            try {
                const { height } = event.nativeEvent.contentSize;
                setThreadInputHeight(height);

                // Calculate new height - match exactly to text content height
                // Subtract a small offset to align with text bottom instead of input bottom
                const newLineHeight = Math.max(10, height - 5);

                // Animate with thread flag to use simpler animation
                animateLineHeight(newLineHeight, 0, true);

                // Always scroll to bottom
                scrollToBottom();
            } catch (error) {
                console.log('Thread content size error:', error);
            }
        }, [animateLineHeight, scrollToBottom]);

        // Handle main text change
        const handleTextChange = useCallback((text: string) => {
            currentTextRef.current = text;
            setPostText(text); // Update state for post button

            // Additional scroll for line break detection
            const prevLineBreaks = (currentTextRef.current.match(/\n/g) || []).length;
            const newLineBreaks = (text.match(/\n/g) || []).length;

            if (newLineBreaks !== prevLineBreaks) {
                // Immediate scroll on line break
                scrollToBottom();
            }
        }, [scrollToBottom]);

        // Handle thread text change
        const handleThreadTextChange = useCallback((text: string) => {
            threadTextRef.current = text;
            setAddToPostText(text);
            scrollToBottom();
        }, [scrollToBottom]);

        // Modal visibility effect with external view scaling
        useEffect(() => {
            if (modalVisible) {
                StatusBar.setBarStyle('light-content', true);

                // Use Animated.parallel for smoother animations
                Animated.parallel([
                    // Animate background overlay
                    Animated.timing(backgroundAnim, {
                        toValue: 0.5,
                        duration: 300,
                        easing: customEasing,
                        useNativeDriver: true,
                    }),

                    // Animate the external scale if provided
                    ...(mainScaleValue ? [
                        Animated.timing(mainScaleValue, {
                            toValue: 0.88,
                            duration: 300,
                            easing: customEasing,
                            useNativeDriver: true,
                        })
                    ] : []),

                    // Scale our internal animation value
                    Animated.timing(scaleAnim, {
                        toValue: 0.88,
                        duration: 300,
                        easing: customEasing,
                        useNativeDriver: true,
                    })
                ]).start();
            } else if (!isDismissing) {
                StatusBar.setBarStyle('dark-content', true);

                // Use Animated.parallel for smoother animations
                Animated.parallel([
                    // Animate background overlay
                    Animated.timing(backgroundAnim, {
                        toValue: 0,
                        duration: 200,
                        easing: customEasing,
                        useNativeDriver: true,
                    }),

                    // Reset the external scale if provided
                    ...(mainScaleValue ? [
                        Animated.timing(mainScaleValue, {
                            toValue: 1,
                            duration: 200,
                            easing: customEasing,
                            useNativeDriver: true,
                        })
                    ] : []),

                    // Reset internal scale
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 200,
                        easing: customEasing,
                        useNativeDriver: true,
                    })
                ]).start();
            }
        }, [modalVisible, mainScaleValue, customEasing, isDismissing]);

        // Function to open the bottom sheet
        const openSheet = useCallback(() => {
            setModalVisible(true);
            bottomSheetRef.current?.present();
        }, []);

        // Function to close the bottom sheet
        const closeSheet = useCallback(() => {
            // Just dismiss keyboard and bottomSheet
            // Let the onDismiss handler manage the modalVisible state
            Keyboard.dismiss();
            bottomSheetRef.current?.dismiss();
            // Remove the setTimeout that sets modalVisible
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
                    enableOverDrag={false}
                    index={0}
                    snapPoints={snapPoints}
                    enablePanDownToClose={true}
                    overDragResistanceFactor={0.1}
                    onDismiss={() => {
                        // Set isDismissing to true to prevent duplicate animations
                        setIsDismissing(true);
                        // Set a small timeout to ensure all animations complete properly
                        setTimeout(() => {
                            setModalVisible(false);
                            // Reset the dismissing flag after state is updated
                            setIsDismissing(false);
                        }, 50);
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
                        <View style={styles.createHeader}>
                            <TouchableOpacity style={[styles.closeButton, { zIndex: 10 }]} onPress={closeSheet}>
                                <Text style={styles.closeButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={styles.sheetTitle}>New thread</Text>
                            <View style={styles.headerButton}>
                                <MaterialCommunityIcons name='sticker-text-outline' size={23} color='#000' />
                                <Ionicons name='ellipsis-horizontal-circle-outline' size={25} color='#000' />
                            </View>
                        </View>
                        <View style={styles.separator} />

                        {/* BottomSheetScrollView for the content */}
                        <BottomSheetScrollView
                            ref={scrollViewRef}
                            contentContainerStyle={[styles.scrollViewContent, { paddingBottom: keyboardHeight + 100 }]}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            onContentSizeChange={scrollToBottom}
                            onLayout={scrollToBottom}
                        >
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
                                        <Animated.View style={[styles.separator2, { height: lineHeightAnim }]} />
                                    </View>

                                    <View style={styles.textContainer}>
                                        <Text style={{ fontSize: 16, fontWeight: '500' }}>antal.lpt</Text>

                                        <TextInput
                                            ref={textInputRef}
                                            placeholder="What's new?"
                                            style={styles.textInput}
                                            multiline={true}
                                            placeholderTextColor={'#a0a0a0'}
                                            onContentSizeChange={onContentSizeChange}
                                            defaultValue=""
                                            onChangeText={handleTextChange}
                                            autoCorrect={false}
                                            selectionColor="#007AFF"
                                            maxFontSizeMultiplier={1.2}
                                        />

                                        {/* Icons with smooth animation */}
                                        <Animated.View
                                            style={[
                                                styles.iconsContainer,
                                                { top: iconsTopAnim }
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
                                        </Animated.View>
                                    </View>
                                </View>

                                {/* Add to thread section with animations */}
                                <View style={styles.addThreadContainer}>
                                    <View style={styles.addThreadLeftColumn}>
                                        <Image
                                            source={require('@/assets/images/profile.png')}
                                            style={styles.img2}
                                            resizeMode='contain'
                                        />

                                        {/* Only show separator when there's text, using absolute positioning */}
                                        {addToPostText !== '' && (
                                            <Animated.View
                                                style={[
                                                    styles.absoluteThreadSeparator,
                                                    { height: threadLineHeightAnim }
                                                ]}
                                            />
                                        )}
                                    </View>

                                    <View style={styles.addThreadTextContainer}>
                                        <TextInput
                                            ref={threadInputRef}
                                            placeholder="Add to thread"
                                            style={styles.addThreadTextInput}
                                            multiline={true}
                                            placeholderTextColor={'#a0a0a0'}
                                            defaultValue=""
                                            onChangeText={handleThreadTextChange}
                                            onContentSizeChange={onThreadContentSizeChange}
                                            maxFontSizeMultiplier={1.2}
                                        />
                                    </View>
                                </View>
                            </View>
                        </BottomSheetScrollView>

                        {/* Use Animated.View for keyboard accessory */}
                        {modalVisible && (
                            <Animated.View
                                style={[
                                    styles.keyboardAccessory,
                                    {
                                        bottom: accessoryPositionAnim,
                                        opacity: accessoryOpacityAnim
                                    }
                                ]}
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
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 100, // Default padding, will be dynamically adjusted
    },
    sheetTitle: {
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '700',
        zIndex: 1,
        paddingBottom: 2
    },
    closeButton: {
        alignSelf: 'center',
    },
    closeButtonText: {
        fontSize: 18,
        fontWeight: '500',
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
    threadSeparator: {
        width: 1,
        backgroundColor: '#a0a0a0',
        flex: 0,
        alignSelf: 'center',
        opacity: 0.3,
        marginTop: 5,
        // Add a small negative offset to fine-tune alignment
        marginBottom: -20
    },
    img: {
        width: 34,
        height: 34,
        borderRadius: 17
    },
    img2: {
        width: 20,
        height: 20,
        borderRadius: 10
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 16,
        gap: 7
    },
    textInput: {
        fontSize: 16,
        fontWeight: '400',
        paddingTop: 0,
        paddingBottom: 25,
        textAlignVertical: 'top',
        width: '100%',
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
        gap: 20,
        alignItems: 'center',
        paddingVertical: 2,
        position: 'absolute',
        left: 0,
        pointerEvents: 'none'
    },
    addThreadContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: 13,
        position: 'relative' // Add relative positioning
    },
    addThreadLeftColumn: {
        width: 34,
        alignItems: 'center',
        position: 'relative' // Add relative positioning
    },
    addThreadTextContainer: {
        flex: 1,
        paddingRight: 8,
        paddingTop: 1
    },
    addThreadTextInput: {
        fontSize: 15,
        fontWeight: '400',
        paddingTop: 1,
        paddingBottom: 8,
        textAlignVertical: 'top',
        width: '100%',
        color: '#a0a0a0'
    },

    // Keyboard accessory styles
    keyboardAccessory: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        zIndex: 10000
    },
    accessoryText: {
        fontSize: 15,
        color: '#8e8e8e',
    },
    postButton: {
        backgroundColor: '#000',
        paddingVertical: 12,
        paddingHorizontal: 17,
        borderRadius: 25,
    },
    postButtonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
    },
    postButtonDisabled: {
        backgroundColor: '#000',
        opacity: 0.35
    },
    postButtonTextDisabled: {
        color: '#fff',
    },
    absoluteThreadSeparator: {
        position: 'absolute',
        width: 1,
        backgroundColor: '#a0a0a0',
        opacity: 0.3,
        left: 17, // Center of the column (34/2)
        top: 25, // Below the profile pic
    }
});

export default ThreadComposer;
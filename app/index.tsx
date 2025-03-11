import { View, StyleSheet, Image, Dimensions, Text, TouchableOpacity, StatusBar } from 'react-native';
import React, { useEffect } from 'react';
import { Link, useRouter } from 'expo-router';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useSSO } from '@clerk/clerk-expo';
const { width } = Dimensions.get('window');
import 'react-native-gesture-handler';

const IMAGE_ASPECT_RATIO = 768 / 831;

const Page = () => {
    const router = useRouter();

    useEffect(() => {
        StatusBar.setHidden(true);
        return () => StatusBar.setHidden(false);
    }, []);

    const { startSSOFlow } = useSSO();

    const handleFacebookSSO = async () => {
        try {
            const { createdSessionId, setActive } = await startSSOFlow({
                strategy: "oauth_facebook",
            });

            if (createdSessionId) {
                setActive!({ session: createdSessionId });
            }
        } catch (err) {
            console.error("SSO error", err);
        }
    };

    return (
        <View style={styles.container}>
            <View>
                <Image
                    source={require('@/assets/images/splashscreen.png')}
                    style={[styles.image, { height: width / IMAGE_ASPECT_RATIO }]}
                    resizeMode='cover'
                />
                <View style={styles.buttonView}>
                    <TouchableOpacity style={styles.loginButton} onPress={handleFacebookSSO}>
                        <View style={styles.loginButtonContent}>
                            <Ionicons name={'logo-instagram'} size={25} color={'#000'} />
                            <Text style={styles.loginButtonText}>{'Continue with Instagram'}</Text>
                            <Feather name='chevron-right' size={20} color={'#9c9c9c'} />
                        </View>
                        <Text style={styles.loginButtonSubtitle}>{"Log in or create a Threads profile with your Instagram account. With a profile, you can post, interact and get personalised recommendations."}</Text>
                    </TouchableOpacity>

                    <Link href={'/usewithoutProfile'} asChild>
                        <TouchableOpacity style={styles.loginButton} >
                            <View style={styles.loginButtonContent}>
                                <MaterialIcons name={'phonelink'} size={23} color={'#000'} />
                                <Text style={styles.loginButtonText}>{'Use without a profile'}</Text>
                                <Feather name='chevron-right' size={20} color={'#9c9c9c'} />
                            </View>
                            <Text style={styles.loginButtonSubtitle}>{"You can browse Threads without a profile, but won't be able to post, interact or get personalised recommendations."}</Text>
                        </TouchableOpacity>
                    </Link>

                </View>
            </View>
            <TouchableOpacity>
                <Text style={styles.switchAccounts}>Switch accounts</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: '#f3f3f3',
    },
    image: {
        width: '100%',
    },
    buttonView: {
        gap: 10,
        paddingHorizontal: 20,
    },
    switchAccounts: {
        fontSize: 15,
        color: '#9c9c9c',
        alignSelf: 'center',
        paddingBottom: 50
    },
    loginButton: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 18,
    },
    loginButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingTop: 3
    },
    loginButtonText: {
        fontSize: 15,
        fontWeight: '600',
        flex: 1
    },
    loginButtonSubtitle: {
        fontSize: 12.5,
        marginTop: 7,
        color: '#9c9c9c'
    },
})

export default Page;
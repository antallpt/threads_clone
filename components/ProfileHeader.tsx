import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { router } from 'expo-router'


type ProfileHeaderProps = {
    userId: string;
    headerTranslateY: Animated.AnimatedInterpolation<string | number>;
    headerOpacity: Animated.AnimatedInterpolation<string | number>;
};

const ProfileHeader = ({ userId, headerTranslateY, headerOpacity }: ProfileHeaderProps) => {

    const { userProfile } = useUserProfile();

    const profileId = userId || userProfile?._id;

    // Only make the query if we have a valid profileId
    const profile = profileId ? useQuery(api.users.getUserById, { userId: profileId as Id<'users'> }) : null;

    const isSelf = userProfile?._id === userId;
    const insets = useSafeAreaInsets();
    const HEADER_HEIGHT = 40;


    return (
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
            <View style={styles.iconsHeader}>
                {isSelf ? (
                    <Ionicons name='lock-closed-outline' color={'#000'} size={24} />
                ) : (
                    <>
                        <TouchableOpacity onPress={router.back} style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 3, left: -8 }}>
                            <Feather name='chevron-left' size={24} color={'#000'} />
                            <Text style={{ fontSize: 17, fontWeight: 300 }}>Back</Text>
                        </TouchableOpacity>
                    </>
                )
                }
                <View style={{ gap: 15, flexDirection: 'row' }}>
                    <Feather name="search" size={24} color="#000" />
                    <MaterialCommunityIcons name='chart-box-outline' color={'#000'} size={26} />
                    <Feather name='instagram' color={'#000'} size={24} />
                    <View style={{ alignSelf: 'center', flexDirection: 'column', gap: 6 }}>
                        <View style={{ width: 19, height: 1.9, backgroundColor: '#000' }} />
                        <View style={{ width: 12, height: 1.9, backgroundColor: '#000', alignSelf: 'flex-end' }} />
                    </View>
                </View>
            </View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        zIndex: 30, // Higher zIndex to ensure it's above profile
    },
    iconsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10,
        paddingHorizontal: 16,
    },
})

export default ProfileHeader
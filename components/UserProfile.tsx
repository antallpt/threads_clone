import { View, Text, Animated, Image, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { useQuery } from 'convex/react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type UserProfileProps = {
    userId?: string;
    headerTranslateY: Animated.AnimatedInterpolation<string | number>;
};

const UserProfile = ({ userId, headerTranslateY }: UserProfileProps) => {
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
                styles.profileContainer,
                {
                    paddingTop: insets.top + HEADER_HEIGHT,
                    transform: [{ translateY: headerTranslateY }]
                }
            ]}
        >
            <View style={styles.profileContent}>
                <View style={styles.profileHeader}>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{profile?.first_name + ' ' + profile?.last_name}</Text>
                        <Text style={styles.profileUsername}>{profile?.username}</Text>
                        <Text style={styles.profileFollowers}>{profile?.followersCount} followers</Text>
                    </View>
                    {profile?.imageUrl ? (
                        <Image
                            source={{ uri: profile?.imageUrl }}
                            style={styles.profileImage}
                        />
                    ) : (
                        <Image
                            source={require('@/assets/images/profile.png')}
                            style={styles.profileImage}
                        />
                    )}
                </View>

                <View style={styles.profileActions}>
                    <TouchableOpacity style={[styles.profileButton, !isSelf && { backgroundColor: '#000', borderColor: 'transparent' }]}>
                        <Text style={[styles.profileButtonText, !isSelf && { color: '#fff', fontWeight: '700' }]}>{isSelf ? 'Edit profile' : ' Follow'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.profileButton}>
                        <Text style={styles.profileButtonText}>{isSelf ? 'Share profile' : ' Mention'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    profileContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        zIndex: 20, // Higher than content, lower than header
    },
    profileContent: {
        padding: 15,
    },
    profileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    profileInfo: {
        flex: 1,
        paddingTop: 20
    },
    profileName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    profileUsername: {
        fontSize: 14,
        color: '#000',
        marginBottom: 3,
    },
    profileFollowers: {
        fontSize: 13,
        color: '#666',
        paddingTop: 10
    },
    profileImage: {
        width: 66,
        height: 66,
        borderRadius: 33,
        backgroundColor: '#eee',
    },
    profileActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 15,
        gap: 10
    },
    profileButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 8,
        alignItems: 'center',
    },
    profileButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
})

export default UserProfile
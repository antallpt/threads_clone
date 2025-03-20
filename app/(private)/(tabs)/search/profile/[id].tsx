import { View } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import Profile from '@/components/Profile';
import { Id } from '@/convex/_generated/dataModel';

const ProfileScreen = () => {
    // Get the userId from the URL params
    const { id } = useLocalSearchParams<{ id: string }>();

    return (
        <View style={{ flex: 1 }}>
            <Profile userId={id as unknown as Id<'users'>} />
        </View>
    );
};

export default ProfileScreen;
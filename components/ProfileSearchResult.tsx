import { Doc } from '@/convex/_generated/dataModel';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';

type ProfileSearchResultProps = {
    user: Doc<'users'>;
};

const ProfileSearchResult = ({ user }: ProfileSearchResultProps) => {
    // Add fallback handling for missing image URLs
    const imageUrl = user?.imageUrl || 'https://via.placeholder.com/40';

    // Add defensive checks for all user properties
    const firstName = user?.first_name || '';
    const lastName = user?.last_name || '';
    const username = user?.username || 'user';
    const followersCount = user?.followersCount || 0;

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                // Add default image on error
                defaultSource={require('@/assets/images/profile.png')}
            />
            <View style={styles.infoContainer}>
                <Text style={styles.name}>
                    {firstName} {lastName}
                </Text>
                <Text style={styles.username}>@{username}</Text>
                <Text style={styles.followers}>{followersCount} followers</Text>
            </View>
            <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ProfileSearchResult;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 16
    },
    image: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0', // Add background color as placeholder
    },
    infoContainer: {
        flex: 1,
        gap: 6,
    },
    name: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    username: {
        fontSize: 14,
        color: 'gray',
    },
    followers: {
        fontSize: 14,
    },
    followButton: {
        padding: 8,
        paddingHorizontal: 24,
        borderRadius: 10,
        borderColor: '#F0F0F0',
        borderWidth: 1,
    },
    followButtonText: {
        fontWeight: 'bold',
    },
});
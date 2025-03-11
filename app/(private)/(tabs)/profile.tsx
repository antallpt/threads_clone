import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useAuth } from '@clerk/clerk-expo';

const Page = () => {

    const { signOut } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut();
            console.log("Erfolgreich ausgeloggt!");
        } catch (err) {
            console.error("Logout Fehler:", err);
        }
    };

    return (
        <View>
            <Text>Profile</Text>
            <TouchableOpacity onPress={handleLogout}>
                <Text>Logout</Text>
            </TouchableOpacity>
        </View>
    )
}

export default Page
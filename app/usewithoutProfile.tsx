import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import NoProfileComponent from '@/components/noProfileComponent'
import { router } from 'expo-router'

const UseWithoutProfile = () => {
    return (
        <View style={styles.container}>
            <View style={{ gap: 90 }}>
                <Text style={styles.title}>{`Use Threads without${'\na'} profile?`}</Text>
                <View style={{ gap: 30 }}>
                    <NoProfileComponent
                        text='Using Threads without a profile'
                        subtext="You can use Threads without a profile to browse content, but you won't be able to post, interact or see recommendations for you. Learn more"
                        icon='user-slash' />
                    <NoProfileComponent
                        text='You can change your choice at any time'
                        subtext="If you want to use Threads with a profile, you can log in with an Instagram account."
                        icon='eye' />
                    <NoProfileComponent
                        text='Terms and privacy'
                        subtext="By using Threads, you agree to the Instagram Terms and Threads Supplemental Terms, and acknowledge that you have read the Meta Privacy Policy and Threads Supplemental Privacy Policy. If you use Threads without a profile, your information will be used for things such as safety, security and integrity, as detailed in our supplemental privacy policy. Learn more"
                        icon='check' />
                </View>
            </View>
            <View style={{ gap: 8, paddingBottom: 40 }}>
                <TouchableOpacity style={styles.btnFilled} onPress={() => router.replace('/(public)/(tabs)/home2')}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Use without a profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btn} onPress={router.back}>
                    <Text style={{ fontWeight: '500' }}>Go back</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fbfbfb',
        justifyContent: 'space-between',
        paddingHorizontal: 20

    },
    title: {
        fontSize: 30,
        fontWeight: '600',
        alignSelf: 'center',
        textAlign: 'center',
        paddingTop: 20
    },
    btnFilled: {
        borderRadius: 18,
        backgroundColor: '#000',
        width: '100%',
        height: 49,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btn: {
        borderRadius: 18,
        backgroundColor: '#fff',
        width: '100%',
        height: 48,
        borderColor: '#b3b3b3',
        borderWidth: StyleSheet.hairlineWidth,
        alignItems: 'center',
        justifyContent: 'center'
    }
})

export default UseWithoutProfile
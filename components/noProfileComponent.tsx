import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { FontAwesome6 } from '@expo/vector-icons'

type NoProfileComponentProps = {
    text: string,
    subtext: string
    icon: typeof FontAwesome6.defaultProps,
}

const NoProfileComponent = ({ text, subtext, icon }: NoProfileComponentProps) => {
    return (

        <View style={styles.cmpcontainer}>
            <FontAwesome6 name={icon} size={20} />
            <View style={styles.txtcontainer}>
                <Text style={styles.textheading}>{text}</Text>
                <Text style={styles.text}>{subtext}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    cmpcontainer: {
        flexDirection: 'row',
        gap: 20,
    },
    txtcontainer: {
        gap: 10,
        flex: 1
    },
    textheading: {
        fontWeight: '400',
    },
    text: {
        color: '#b3b3b3',
        fontSize: 13
    }
})

export default NoProfileComponent
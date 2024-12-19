import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
    navigation.setOptions({
        headerStyle: {
            height: 80,
        },
        headerTitle: () => (
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Mental Health Monitoring</Text>
        ),
        headerRight: () => (
            <View style={{marginRight:20}}>
            <TouchableOpacity onPress={() => navigation.navigate('Account')} style={{ marginLeft: 15 }}>
                <Ionicons name="person-circle" size={30} color="black" />
            </TouchableOpacity>
            </View>
        ),
    })
    return (
        <View style={styles.container}>
            <Text style={styles.bodyText}>TO DO add mock up cards</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    bodyText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
    },
});

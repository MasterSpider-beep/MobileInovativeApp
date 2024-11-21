import React from 'react';
import {DarkTheme, DefaultTheme, NavigationContainer, ThemeProvider} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Ionicons} from '@expo/vector-icons';

// Screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import DeviceScreen from './screens/DeviceScreen';
import AccountScreen from './screens/AccountScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({route}) => ({
                tabBarIcon: ({color, size}) => {
                    let iconName: keyof typeof Ionicons.glyphMap;
                    if (route.name === 'Home') iconName = 'home';
                    else if (route.name === 'Chat') iconName = 'chatbox-ellipses';
                    else if (route.name === 'Device') iconName = 'watch';

                    // @ts-ignore
                    return <Ionicons name={iconName} size={size} color={color}/>;
                },
                tabBarActiveTintColor: 'tomato',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen}/>
            <Tab.Screen name="Chat" component={ChatScreen} options={{headerShown: false}}/>
            <Tab.Screen name="Device" component={DeviceScreen} options={{headerShown: false}}/>
        </Tab.Navigator>
    );
}

export default function App() {
    return (
        <ThemeProvider value={DarkTheme}>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}}/>
                <Stack.Screen name="Main" component={MainTabNavigator} options={{headerShown: false}}/>
                <Stack.Screen name="Account" component={AccountScreen} options={{headerShown: false}}/>
            </Stack.Navigator>
        </ThemeProvider>
    );
}

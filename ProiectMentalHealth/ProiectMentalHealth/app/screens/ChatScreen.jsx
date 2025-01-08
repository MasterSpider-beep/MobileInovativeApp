import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
} from 'react-native';
import {getAdviceAPI} from "@/app/api/api_calls";

export default function ChatScreen() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userInput, setUserInput] = useState('');

    const handleSend = async () => {
        if (!userInput.trim()) return;

        // Add user's message to the chat
        const newMessages = [
            ...messages,
            { id: Date.now().toString(), text: userInput, sender: 'user' },
        ];
        setMessages(newMessages);
        setUserInput('');


        setLoading(true);
        try {
            const advice = await getAdviceAPI();
            setMessages((prev) => [
                ...prev,
                { id: (Date.now() + 1).toString(), text: advice, sender: 'bot' },
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { id: (Date.now() + 2).toString(), text: 'Failed to fetch advice. Try again later.', sender: 'bot' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = ({ item }) => {
        const isUser = item.sender === 'user';
        return (
            <View
                style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.botBubble,
                ]}
            >
                <Text style={styles.messageText}>{item.text}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                style={styles.chatContainer}
                contentContainerStyle={styles.chatContent}
            />
            {loading && <Text style={styles.loadingText}>Bot is typing...</Text>}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type your message..."
                    value={userInput}
                    onChangeText={setUserInput}
                />
                <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    chatContainer: {
        flex: 1,
        padding: 10,
    },
    chatContent: {
        paddingBottom: 20,
    },
    messageBubble: {
        marginVertical: 5,
        padding: 10,
        borderRadius: 10,
        maxWidth: '80%',
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#3fa4e8',
    },
    botBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#e1e1e1',
    },
    messageText: {
        fontSize: 16,
        color: '#fff',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 10,
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: '#3fa4e8',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    loadingText: {
        textAlign: 'center',
        color: '#999',
        fontStyle: 'italic',
        marginVertical: 5,
    },
});

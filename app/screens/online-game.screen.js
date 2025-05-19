// app/screens/online-game.screen.js

import React, { useContext, useEffect } from "react";
import { StyleSheet, View, Button, Text } from "react-native";
import { SocketContext } from '../contexts/socket.context';
import OnlineGameController from "../controllers/online-game.controller";


export default function OnlineGameScreen({ navigation }) {

    const socket = useContext(SocketContext) || (typeof window !== "undefined" && window.__BOT_SOCKET__);;

    useEffect(() => {
        navigation.setOptions({
            headerShown: false, // Cache complètement l'en-tête
        });
    }, [navigation]);

    return (
        <View style={styles.container}>
            {!socket && (
                <>
                    <Text style={styles.paragraph}>
                        No connection with server...
                    </Text>
                    <Text style={styles.footnote}>
                        Restart the app and wait for the server to be back again.
                    </Text>
                </>
            )}

            {socket && (
                <OnlineGameController navigation={navigation}/>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    }
});

// app/components/board/choices/choices.component.js

import React, { useState, useContext, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Platform, Dimensions } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";

const Choices = () => {

    const socket = useContext(SocketContext) || (typeof window !== "undefined" && window.__BOT_SOCKET__);

    const [displayChoices, setDisplayChoices] = useState(false);
    const [canMakeChoice, setCanMakeChoice] = useState(false);
    const [idSelectedChoice, setIdSelectedChoice] = useState(null);
    const [availableChoices, setAvailableChoices] = useState([]);

    useEffect(() => {
        // Nettoyage des anciens listeners pour éviter les doublons
        return () => {
            socket.off("game.choices.view-state");
            socket.off("game.start"); // Ajouté pour reset l'état sur mobile
        };
    }, [socket]);

    useEffect(() => {
        const onChoicesViewState = (data) => {
            console.log("CHOICES VIEW STATE", data);
            if (socket && socket.id) {
                console.log("Socket.id courant (client):", socket.id);
                if (data && data.socketIdForTurn) {
                    console.log("Socket.id du joueur qui doit jouer (serveur):", data.socketIdForTurn);
                    if (socket.id === data.socketIdForTurn && (!data.canMakeChoice || !data.availableChoices || data.availableChoices.length === 0)) {
                        console.error("❌ Le serveur n'envoie pas les choix ou canMakeChoice:true alors que c'est le tour de ce joueur !");
                    }
                    if (socket.id !== data.socketIdForTurn && data.canMakeChoice) {
                        console.warn("⚠️ Ce client reçoit canMakeChoice:true alors que ce n'est pas son tour !");
                    }
                }
            }
            if (!data || !data.availableChoices || data.availableChoices.length === 0) {
                console.warn("Aucun choix reçu pour ce joueur. Vérifie le backend !");
            }
            setDisplayChoices(data['displayChoices']);
            setCanMakeChoice(data['canMakeChoice']);
            setIdSelectedChoice(data['idSelectedChoice']);
            setAvailableChoices(data['availableChoices']);
        };

        const onGameStart = () => {
            // Reset complet de l'état Choices à chaque nouvelle partie (utile sur mobile)
            setDisplayChoices(false);
            setCanMakeChoice(false);
            setIdSelectedChoice(null);
            setAvailableChoices([]);
        };

        socket.on("game.choices.view-state", onChoicesViewState);
        socket.on("game.start", onGameStart); // Ajouté

        return () => {
            socket.off("game.choices.view-state", onChoicesViewState);
            socket.off("game.start", onGameStart); // Ajouté
        };
    }, [socket]);

    const handleSelectChoice = (choiceId) => {
        if (canMakeChoice) {
            setIdSelectedChoice(choiceId);
            socket.emit("game.choices.selected", { choiceId });
            // Correction : ne pas masquer les choix ni changer displayChoices ici !
            // Le backend doit renvoyer un nouvel état via "game.choices.view-state" ou "game.grid.view-state"
        }
    };

    const isMobile =
        Platform.OS === "ios" ||
        Platform.OS === "android" ||
        Dimensions.get('window').width < 600;

    return (
        <View style={[
            styles.choicesContainer,
            isMobile && styles.choicesContainerMobile
        ]}>
            {displayChoices &&
                <View style={isMobile ? styles.choicesRowMobile : styles.choicesRowDesktop}>
                    {availableChoices.map((choice) => (
                        <TouchableOpacity
                            key={choice.id}
                            style={[
                                isMobile ? styles.choiceButtonMobile : styles.choiceButtonDesktop,
                                idSelectedChoice === choice.id && (isMobile ? styles.selectedChoiceMobile : styles.selectedChoiceDesktop),
                                !canMakeChoice && styles.disabledChoice
                            ]}
                            onPress={() => handleSelectChoice(choice.id)}
                            disabled={!canMakeChoice}
                        >
                            <Text style={isMobile ? styles.choiceTextMobile : styles.choiceTextDesktop}>{choice.value}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    choicesContainer: {
        flex: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 16,
        padding: 15,
        margin: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 7,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.85)',
    },
    choicesContainerMobile: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'nowrap',
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
        paddingBottom: 0,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 0,
        marginBottom: 0,
        minHeight: 70,
        maxHeight: 70,
        height: 70,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.5)',
        overflow: 'hidden',
        width: 'auto',
    },
    choicesRowDesktop: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    choicesRowMobile: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'nowrap',
        width: '100%',
        height: 70,
    },
    choiceButtonDesktop: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 10,
        marginVertical: 8,
        marginHorizontal: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        minWidth: 120,
        width: '80%',
        alignItems: 'center',
    },
    choiceButtonMobile: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        marginHorizontal: 6,
        marginVertical: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        minWidth: 70,
    },
    selectedChoiceDesktop: {
        backgroundColor: "rgba(255, 243, 176, 0.9)",
        transform: [{ scale: 1.04 }],
    },
    selectedChoiceMobile: {
        backgroundColor: "rgba(255, 243, 176, 0.9)",
        transform: [{ scale: 1.08 }],
    },
    choiceTextDesktop: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        textAlign: 'center',
    },
    choiceTextMobile: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2c3e50',
        textAlign: 'center',
    },
    disabledChoice: {
        opacity: 0.5,
    },
});

export default Choices;

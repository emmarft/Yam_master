// app/controller/online-game.controller.js

import React, { useEffect, useState, useContext } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { SocketContext } from '../contexts/socket.context';
import Board from "../components/board/board.component";


export default function OnlineGameController({ navigation }) {

    const socket = useContext(SocketContext);

    const [inQueue, setInQueue] = useState(false);
    const [inGame, setInGame] = useState(false);
    const [idOpponent, setIdOpponent] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [finalScores, setFinalScores] = useState({ player1Score: 0, player2Score: 0 });

    useEffect(() => {
        console.log('[emit][queue.join]:', socket.id);
        socket.emit("queue.join");
        setInQueue(false);
        setInGame(false);

        socket.on('queue.added', (data) => {
            console.log('[listen][queue.added]:', data);
            setInQueue(data['inQueue']);
            setInGame(data['inGame']);
        });

        socket.on('game.start', (data) => {
            console.log('[listen][game.start]:', data);
            setInQueue(data['inQueue']);
            setInGame(data['inGame']);
            setIdOpponent(data['idOpponent']);
            console.log('Game started. Opponent ID:', data['idOpponent']);
        });

        socket.on('game.grid.view-state', (data) => {
            console.log('[listen][game.grid.view-state]:', data);
        });

        socket.on('game.over', (data) => {
            console.log('[listen][game.over]:', data);
            setGameOver(true);
            setWinner(data.winner);
            setFinalScores({ player1Score: data.player1Score, player2Score: data.player2Score });
        });

        socket.on('queue.left', (data) => {
            console.log('[listen][queue.left]:', data);
            setInQueue(data['inQueue']);
            setInGame(data['inGame']);
            navigation.navigate('HomeScreen');
        });
    }, []);

    const handleReplay = () => {
        setGameOver(false);
        setWinner(null);
        setFinalScores({ player1Score: 0, player2Score: 0 });
        socket.emit('queue.join');
    };

    return (
        <View style={styles.container}>
            {gameOver ? (
                <>
                    <Text style={styles.paragraph}>Game Over!</Text>
                    {winner === "draw" ? (
                        <Text style={styles.paragraph}>Match nul !</Text>
                    ) : (
                        <Text style={styles.paragraph}>Winner: {winner}</Text>
                    )}
                    <Text style={styles.paragraph}>Player 1 Score: {finalScores.player1Score}</Text>
                    <Text style={styles.paragraph}>Player 2 Score: {finalScores.player2Score}</Text>
                    <Button title="Rejouer" onPress={handleReplay} />
                </>
            ) : (
                <>
                    {!inQueue && !inGame && (
                        <Text style={styles.paragraph}>Waiting for server datas...</Text>
                    )}

                    {inQueue && (
                        <>
                            <Text style={styles.paragraph}>Waiting for another player...</Text>
                            <Button
                                title="Quittez la file d'attente"
                                onPress={() => socket.emit("queue.leave")}
                            />
                        </>
                    )}

                    {inGame && <Board gameViewState={{ player1Score: 0, player2Score: 0 }} />}
                </>
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
        width: '100%',
        height: '100%',
    },
    paragraph: {
        fontSize: 16,
        fontWeight: "bold", // Texte en gras
        color: "#555555", // Couleur de texte plus douce
        textAlign: "center", // Centrer le texte
        marginVertical: 10, // Espacement vertical
    },
    button: {
        backgroundColor: "#007bff", // Couleur bleue pour le bouton
        color: "#ffffff", // Texte blanc
        padding: 10, // Espacement interne
        borderRadius: 5, // Coins arrondis
    },
});

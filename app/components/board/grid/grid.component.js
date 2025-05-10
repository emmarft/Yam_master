import React, {useEffect, useContext, useState} from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";

const Grid = () => {

    const socket = useContext(SocketContext);

    const [displayGrid, setDisplayGrid] = useState(false);
    const [canSelectCells, setCanSelectCells] = useState([]);
    const [grid, setGrid] = useState([]);
    const [player1Score, setPlayer1Score] = useState(0);
    const [player2Score, setPlayer2Score] = useState(0);
    const [tokensLeft, setTokensLeft] = useState({ player1: 12, player2: 12 });
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [scores, setScores] = useState({ player1: 0, player2: 0 });
    const [finalScores, setFinalScores] = useState({ player1: 0, player2: 0 });

    const handleSelectCell = (cellId, rowIndex, cellIndex) => {
        if (canSelectCells) {
            socket.emit("game.grid.selected", { cellId, rowIndex, cellIndex });
        }
    };

    useEffect(() => {
        socket.on("game.start", () => {
            // Réinitialiser tous les états au début d'une nouvelle partie
            setTokensLeft({ player1: 12, player2: 12 });
            setPlayer1Score(0);
            setPlayer2Score(0);
            setScores({ player1: 0, player2: 0 });
            setFinalScores({ player1: 0, player2: 0 });
            setGameOver(false);
            setWinner(null);
        });

        socket.on("game.grid.view-state", (data) => {
            setDisplayGrid(data['displayGrid']);
            setCanSelectCells(data['canSelectCells']);
            setGrid(data['grid']);
            setPlayer1Score(data['player1Score']);
            setPlayer2Score(data['player2Score']);
            setTokensLeft(data['tokensLeft']);
        });

        socket.on("game.over", (data) => {
            setGameOver(true);
            setWinner(data.winner);
            // Utiliser les scores envoyés dans data
            setFinalScores(data.scores);
        });
    }, []);

    const GameOverScreen = () => (
        <View style={styles.gameOverContainer}>
            <Text style={styles.gameOverTitle}>Partie terminée !</Text>
            <View style={styles.finalScoresContainer}>
                <Text style={styles.finalScoreTitle}>Scores finaux</Text>
                <Text style={[styles.playerScore, winner === "player:1" && styles.winnerScore]}>
                    Joueur 1 : {finalScores.player1} points {winner === "player:1" && "🏆"}
                </Text>
                <Text style={[styles.playerScore, winner === "player:2" && styles.winnerScore]}>
                    Joueur 2 : {finalScores.player2} points {winner === "player:2" && "🏆"}
                </Text>
            </View>
            <Text style={styles.resultText}>
                {winner === "draw" 
                    ? "Match nul !" 
                    : `Le ${winner === "player:1" ? "Joueur 1" : "Joueur 2"} remporte la partie !`}
            </Text>
        </View>
    );

    return (
        <View style={styles.gridContainer}>
            {gameOver ? <GameOverScreen /> : (
                <>
                    <View style={styles.playersContainer}>
                        <View style={styles.playerColumn}>
                            <Text style={styles.playerTitle}>Joueur 1</Text>
                            <Text style={styles.scoreText}>{player1Score} points</Text>
                            <View style={styles.tokenContainer}>
                                <Text style={styles.tokenTitle}>Pions restants</Text>
                                <Text style={styles.tokenCount}>{tokensLeft.player1}</Text>
                                <Text style={styles.tokenText}>sur 12</Text>
                            </View>
                        </View>
                        <View style={styles.playerColumn}>
                            <Text style={styles.playerTitle}>Joueur 2</Text>
                            <Text style={styles.scoreText}>{player2Score} points</Text>
                            <View style={styles.tokenContainer}>
                                <Text style={styles.tokenTitle}>Pions restants</Text>
                                <Text style={styles.tokenCount}>{tokensLeft.player2}</Text>
                                <Text style={styles.tokenText}>sur 12</Text>
                            </View>
                        </View>
                    </View>
                    {displayGrid &&
                        grid.map((row, rowIndex) => (
                            <View key={rowIndex} style={styles.row}>
                                {row.map((cell, cellIndex) => (
                                    
                                    <TouchableOpacity
                                    
                                        key={cell.id + '-' + rowIndex + '-' + cellIndex}
                                        style={[
                                            styles.cell,
                                            cell.owner === "player:1" && styles.playerOwnedCell,
                                            cell.owner === "player:2" && styles.opponentOwnedCell,
                                            (cell.canBeChecked && !(cell.owner === "player:1") && !(cell.owner === "player:2")) && styles.canBeCheckedCell,
                                            rowIndex !== 0 && styles.topBorder,
                                            cellIndex !== 0 && styles.leftBorder,
                                        ]}
                                        onPress={() => handleSelectCell(cell.id, rowIndex, cellIndex)}
                                        disabled={!cell.canBeChecked}
                                    >
                                        <Text style={styles.cellText}>{cell.viewContent}</Text>
                                        
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    gridContainer: {
        flex: 7,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        backgroundColor: "#f5f5f5",
        padding: 10,
    },
    playersContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
    },
    playerColumn: {
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        width: '45%',
    },
    playerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    scoreText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 8,
    },
    tokenContainer: {
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 8,
        borderRadius: 6,
        width: '100%',
    },
    tokenTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    tokenCount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    tokenText: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    row: {
        flexDirection: "row",
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    cell: {
        flexDirection: "row",
        flex: 2,
        width: "90%",
        height: "90%",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8, // Bordures arrondies
        backgroundColor: "#fff", // Fond blanc pour les cellules
        shadowColor: "#000", // Ombre pour donner de la profondeur
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    cellText: {
        fontSize: 12,
        fontWeight: "bold",
    },
    playerOwnedCell: {
        backgroundColor: "#ff69b4",
        opacity: 0.9,
    },
    opponentOwnedCell: {
        backgroundColor: "#ba55d3",
        opacity: 0.9,
    },
    canBeCheckedCell: {
        backgroundColor: "#fff3b0",
    },
    topBorder: {
        borderTopWidth: 1,
        borderTopColor: "#ddd",
    },
    leftBorder: {
        borderLeftWidth: 1,
        borderLeftColor: "#ddd",
    },
    playerInfo: {
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    scoreResult: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2ecc71',
        marginVertical: 10,
    },
    scoreDetail: {
        fontSize: 16,
        color: '#666',
        marginVertical: 5,
    },
    gameOverContainer: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 5,
        margin: 20,
    },
    gameOverTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#2c3e50',
    },
    resultText: {
        fontSize: 20,
        marginBottom: 15,
        color: '#2c3e50',
    },
    finalScoresContainer: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 8,
        marginVertical: 15,
        width: '80%',
        alignItems: 'center'
    },
    finalScoreTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 10
    },
    playerScore: {
        fontSize: 18,
        marginVertical: 5,
        color: '#34495e'
    },
    winnerScore: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#27ae60'
    }
});

export default Grid;

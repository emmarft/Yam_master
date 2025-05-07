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

    const handleSelectCell = (cellId, rowIndex, cellIndex) => {
        if (canSelectCells) {
            socket.emit("game.grid.selected", { cellId, rowIndex, cellIndex });
        }
    };

    useEffect(() => {
        socket.on("game.grid.view-state", (data) => {
            setDisplayGrid(data['displayGrid']);
            setCanSelectCells(data['canSelectCells']);
            setGrid(data['grid']);
            setPlayer1Score(data['player1Score']);
            setPlayer2Score(data['player2Score']);
        });
    }, []);

    return (
        <View style={styles.gridContainer}>
            <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>Player 1 Score: {player1Score}</Text>
                <Text style={styles.scoreText}>Player 2 Score: {player2Score}</Text>
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
    scoreContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    scoreText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
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
});

export default Grid;

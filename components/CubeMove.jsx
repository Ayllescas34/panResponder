import React, {useRef} from 'react';
import {Animated, View, StyleSheet, PanResponder, Text} from 'react-native';
import Carro from './Carro'; // Assuming Carro is in the same directory
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import {useWindowDimensions} from 'react-native';

export const CubeMove = () => {
    const pan = useRef(new Animated.ValueXY()).current;
    const {width, height} = useWindowDimensions();

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: Animated.event([null, {dx: pan.x, dy: pan.y}], {
                useNativeDriver: false,
            }),
            onPanResponderRelease: (_, gestureState) => {
                const {moveX, moveY, dx, dy} = gestureState;

                if (
                    moveX < 20 || 
                    moveY < 20 || 
                    moveX > width - 20 || 
                    moveY > height - 20 ||
                    dx < -width / 2 || 
                    dy < -height / 2
                ) {
                    Animated.spring(pan, {
                        toValue: {x: 0, y: 0},
                        useNativeDriver: false,
                    }).start();
                } else {
                    pan.extractOffset();
                }
            },
        }),
    ).current;

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <Text style={styles.titleText}>Drag this box!</Text>
                <Animated.View
                    style={{
                        transform: [{translateX: pan.x}, {translateY: pan.y}],
                    }}
                    {...panResponder.panHandlers}>
                    <View style={styles.box} /> {/* Added box for visual reference */}
                    
                </Animated.View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: 'bold',
  },
  box: {
    height: 100,
    width: 100,
    backgroundColor: 'blue',
    borderRadius: 10,
  },
  carro:{
    width: 30,
    height: 30,
  },
});
import React, { useRef, useState } from 'react';
import {
  Animated,
  View,
  StyleSheet,
  PanResponder,
  Text,
  useWindowDimensions,
  Alert,
} from 'react-native';

const COLORS = ['green', 'gray', 'blue', '#ffa333'];

export const CubeMove = () => {
  const { width, height } = useWindowDimensions();

  const [dropZones, setDropZones] = useState({});
  const [dropped, setDropped] = useState({});

  const createDropZoneRef = (color) => (event) => {
    event.target.measure((x, y, w, h, pageX, pageY) => {
      setDropZones((prev) => ({
        ...prev,
        [color]: { x: pageX, y: pageY, width: w, height: h },
      }));
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Arrastra el cubo al color correcto</Text>

      <View style={styles.row}>
        {/* Columna izquierda: cubos */}
        <View style={styles.column}>
          {COLORS.map((color) => (
            <DraggableCube
              key={color}
              color={color}
              dropZones={dropZones}
              onDropSuccess={() =>
                setDropped((prev) => ({ ...prev, [color]: true }))
              }
              disabled={!!dropped[color]}
              screenWidth={width}
              screenHeight={height}
            />
          ))}
        </View>

        {/* Columna derecha: cajas destino */}
        <View style={styles.column}>
          {COLORS.map((color) => (
            <View
              key={color}
              style={[styles.dropZone, { backgroundColor: color }]}
              onLayout={createDropZoneRef(color)}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const DraggableCube = ({
  color,
  dropZones,
  onDropSuccess,
  disabled,
  screenWidth,
  screenHeight,
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [locked, setLocked] = useState(false);
  const hasShownAlert = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => !disabled && !locked,
      onPanResponderMove: (_, gesture) => {
        if (!disabled && !locked) {
          pan.setValue({ x: gesture.dx, y: gesture.dy });
        }
      },
      onPanResponderRelease: (_, gesture) => {
        const { moveX, moveY } = gesture;

        let droppedCorrectly = false;

        for (const zoneColor in dropZones) {
          const zone = dropZones[zoneColor];

          const margin = 10;
          if (
            moveX >= zone.x - margin &&
            moveX <= zone.x + zone.width + margin &&
            moveY >= zone.y - margin &&
            moveY <= zone.y + zone.height + margin
          ) {
            if (zoneColor === color) {
              droppedCorrectly = true;
              setLocked(true);

              Animated.parallel([
                Animated.spring(pan, {
                  toValue: {
                    x: zone.x - 50,
                    y: zone.y - 50,
                  },
                  useNativeDriver: false,
                }),
                Animated.sequence([
                  Animated.spring(scale, {
                    toValue: 1.3,
                    useNativeDriver: false,
                  }),
                  Animated.spring(scale, {
                    toValue: 1,
                    useNativeDriver: false,
                  }),
                ]),
              ]).start(() => {
                if (!hasShownAlert.current) {
                  hasShownAlert.current = true;
                  Alert.alert('Correcto', '¡Buen trabajo!', [{ text: 'OK' }]);
                }
                onDropSuccess();
              });
            } else {
              Animated.spring(pan, {
                toValue: { x: 0, y: 0 },
                useNativeDriver: false,
              }).start(() => {
                if (!hasShownAlert.current) {
                  hasShownAlert.current = true;
                  Alert.alert('Incorrecto', 'Intenta de nuevo.', [
                    {
                      text: 'OK',
                      onPress: () => {
                        hasShownAlert.current = false;
                      },
                    },
                  ]);
                }
              });
            }
            return;
          }
        }

        if (!droppedCorrectly) {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start(() => {
            if (!hasShownAlert.current) {
              hasShownAlert.current = true;
              Alert.alert('Incorrecto', 'Intenta de nuevo.', [
                {
                  text: 'OK',
                  onPress: () => {
                    hasShownAlert.current = false;
                  },
                },
              ]);
            }
          });
        }
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.cube,
        {
          backgroundColor: color,
          transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale }],
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    marginHorizontal: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  column: {
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
  },
  cube: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  dropZone: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 10,
  },
});
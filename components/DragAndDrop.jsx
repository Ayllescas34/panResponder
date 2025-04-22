import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';

// Obtiene el ancho de la pantalla del dispositivo
const { width } = Dimensions.get('window');

// Elementos disponibles (vehículos)
const VEHICLES = [
  { id: '1', label: '🚗 Coche' },
  { id: '2', label: '🛻 Camioneta' },
  { id: '3', label: '🏍️ Motocicleta' }, // Cambio de Bicicleta a Motocicleta
];

// Zonas de estacionamiento
const PARKING_ZONES = [
  { name: 'Zona de Coche', allowedId: '1', color: 'gray' }, // Coche en gris
  { name: 'Zona de Camioneta', allowedId: '2', color: 'yellow' }, // Camioneta en amarillo
  { name: 'Zona de Motocicleta', allowedId: '3', color: 'white' }, // Motocicleta en blanco
];

const DragAndDrop = () => {
  // Estado para almacenar las posiciones de las zonas de estacionamiento y los elementos arrastrados
  const [dropZonesLayout, setDropZonesLayout] = useState({});
  const [droppedItems, setDroppedItems] = useState({}); // zona.name -> item

  // Se utiliza useRef para almacenar las posiciones de los vehículos en la pantalla
  const positions = useRef(
    VEHICLES.reduce((acc, item) => {
      acc[item.id] = new Animated.ValueXY({ x: 0, y: 0 }); // Inicializa las posiciones de los vehículos en (0, 0)
      return acc;
    }, {})
  ).current;

  // Se crea un objeto para manejar los PanResponder de cada vehículo
  const panResponders = VEHICLES.reduce((acc, item) => {
    acc[item.id] = PanResponder.create({
      // Permite empezar a manejar el gesto
      onStartShouldSetPanResponder: () => true,

      // Mueve el vehículo durante el gesto de arrastre
      onPanResponderMove: Animated.event(
        [null, { dx: positions[item.id].x, dy: positions[item.id].y }], 
        { useNativeDriver: false }
      ),

      // Cuando se suelta el vehículo
      onPanResponderRelease: (_, gesture) => {
        const { moveX, moveY } = gesture; // Obtiene las coordenadas finales del gesto
        let accepted = false; // Bandera que indica si el vehículo fue colocado correctamente

        // Verifica si el vehículo se ha soltado sobre una zona válida
        PARKING_ZONES.forEach((zone) => {
          const layout = dropZonesLayout[zone.name]; // Obtiene el layout de la zona
          if (layout) {
            // Verifica si las coordenadas del vehículo están dentro de los límites de la zona
            const isInside =
              moveX > layout.x &&
              moveX < layout.x + layout.width &&
              moveY > layout.y &&
              moveY < layout.y + layout.height;

            // Si está dentro y la zona es válida para ese vehículo, lo asigna
            if (isInside && zone.allowedId === item.id) {
              setDroppedItems((prev) => ({ ...prev, [zone.name]: item }));
              accepted = true; // El vehículo fue aceptado en la zona
            }
          }
        });

        // Si no es aceptado, vuelve el vehículo a la posición original
        if (positions[item.id]) {
          Animated.spring(positions[item.id], {
            toValue: { x: 0, y: 0 }, // Mueve el vehículo a la posición inicial
            useNativeDriver: false,
          }).start();
        }

        // Si el vehículo no se colocó correctamente, muestra un mensaje en consola
        if (!accepted) {
          console.log('¡Vehículo incorrecto para esa zona!');
        }
      },
    });

    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <View style={styles.dropZonesContainer}>
        {/* Muestra las zonas de estacionamiento */}
        {PARKING_ZONES.map((zone) => (
          <View
            key={zone.name}
            style={[styles.dropZone, { backgroundColor: zone.color }]} // Asignación dinámica del color según la zona
            onLayout={(event) => {
              const layout = event.nativeEvent.layout; // Obtiene el layout de la zona
              console.log('Zona layout:', layout); // Verifica las dimensiones de la zona
              setDropZonesLayout((prev) => ({
                ...prev,
                [zone.name]: layout, // Guarda las dimensiones de cada zona
              }));
            }}
          >
            <Text style={styles.dropZoneLabel}>{zone.name}</Text>
            <Text style={styles.dropZoneContent}>
              {/* Muestra el vehículo que ha sido soltado en la zona, si hay alguno */}
              {droppedItems[zone.name]?.label || 'Suelta aquí'}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.itemsContainer}>
        {/* Muestra los vehículos que se pueden arrastrar */}
        {VEHICLES.map((item) => (
          <Animated.View
            key={item.id}
            style={[styles.item, positions[item.id].getLayout()]} // Aplica las posiciones animadas de los vehículos
            {...panResponders[item.id].panHandlers} // Asocia el PanResponder con cada vehículo
          >
            <Text style={styles.itemText}>{item.label}</Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

// Estilos utilizados para la vista y los elementos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef', // Color de fondo
    paddingTop: 40, // Espaciado superior
    paddingHorizontal: 10, // Espaciado horizontal
  },
  dropZonesContainer: {
    flexDirection: 'row', // Distribuye las zonas de estacionamiento horizontalmente
    justifyContent: 'space-around', // Espacio igual entre zonas
    flexWrap: 'wrap', // Permite que las zonas se ajusten en varias líneas
    marginBottom: 40, // Espaciado inferior
  },
  dropZone: {
    width: width / 3.3, // Ancho de la zona de estacionamiento
    height: 140, // Altura de la zona
    borderColor: '#339', // Color del borde
    borderWidth: 2, // Grosor del borde
    borderRadius: 12, // Bordes redondeados
    padding: 10, // Relleno interno
    alignItems: 'center', // Alineación horizontal de los elementos dentro de la zona
    justifyContent: 'center', // Alineación vertical de los elementos dentro de la zona
    marginBottom: 10, // Espaciado inferior entre zonas
  },
  dropZoneLabel: {
    fontWeight: 'bold', // Texto en negrita
    fontSize: 16, // Tamaño de fuente
    marginBottom: 6, // Espaciado inferior
  },
  dropZoneContent: {
    fontSize: 18, // Tamaño de fuente
  },
  itemsContainer: {
    flex: 1, // Toma el resto del espacio disponible
    alignItems: 'center', // Alinea los vehículos en el centro horizontalmente
  },
  item: {
    width: 200, // Ancho del vehículo
    height: 60, // Altura del vehículo
    backgroundColor: '#fff', // Color de fondo del vehículo
    borderRadius: 10, // Bordes redondeados
    marginVertical: 10, // Espaciado vertical entre vehículos
    justifyContent: 'center', // Alineación vertical del texto dentro del vehículo
    alignItems: 'center', // Alineación horizontal del texto dentro del vehículo
    elevation: 3, // Sombra en Android
    shadowColor: '#000', // Color de la sombra
    shadowOpacity: 0.2, // Opacidad de la sombra
    shadowOffset: { width: 0, height: 2 }, // Desplazamiento de la sombra
  },
  itemText: {
    fontSize: 18, // Tamaño de fuente del texto del vehículo
  },
});

export default DragAndDrop;

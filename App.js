import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DragAndDrop from './components/DragAndDrop';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DragAndDrop />
    </GestureHandlerRootView>
  );
}

import * as React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { DraxProvider, DraxView, DraxList } from 'react-native-drax';

export default function DragAndDrop() {
  const draggableItemList = [
    { id: 1, name: 'A', background_color: 'red' },
    { id: 2, name: 'B', background_color: 'pink' },
    { id: 3, name: 'C', background_color: 'orange' },
    { id: 4, name: 'D', background_color: '#aaaaff' },
    { id: 5, name: 'E', background_color: 'green' },
    { id: 6, name: 'F', background_color: 'gray' },
    { id: 7, name: 'G', background_color: '#aafffa' },
    { id: 8, name: 'H', background_color: 'aqua' },
  ];

  const FirstReceivingItemList = [
    { id: 13, name: 'M', background_color: '#ffaaff' },
    { id: 14, name: 'N', background_color: '#ffaaff' },
    { id: 15, name: 'O', background_color: '#ffaaff' },
    { id: 16, name: 'P', background_color: '#ffaaff' }
  ];

  const [receivingItemList, setReceivedItemList] = React.useState(FirstReceivingItemList);
  const [dragItemMiddleList, setDragItemListMiddle] = React.useState(draggableItemList);

  const DragUIComponent = ({ item }) => (
    <DraxView
      style={[styles.centeredContent, styles.draggableBox, { backgroundColor: item.background_color }]}
      draggingStyle={styles.dragging}
      dragReleasedStyle={styles.dragging}
      hoverDraggingStyle={styles.hoverDragging}
      dragPayload={item.id}
      longPressDelay={150}
    >
      <Text style={styles.textStyle}>{item.name}</Text>
    </DraxView>
  );

  const ReceivingZoneUIComponent = ({ item, index }) => (
    <DraxView
      style={[styles.centeredContent, styles.receivingZone, { backgroundColor: item.background_color }]}
      receivingStyle={styles.receiving}
      renderContent={({ viewState }) => {
        return (
          <View>
            <Text style={styles.textStyle}>{item.name}</Text>
          </View>
        );
      }}
      onReceiveDragDrop={(event) => {
        const draggedIndex = dragItemMiddleList.findIndex(i => i.id === event.dragged.payload);
        if (draggedIndex === -1) return;

        const selected_item = dragItemMiddleList[draggedIndex];
        const newReceivingItemList = [...receivingItemList];
        newReceivingItemList[index] = selected_item;
        setReceivedItemList(newReceivingItemList);

        const newDragItemMiddleList = [...dragItemMiddleList];
        newDragItemMiddleList[draggedIndex] = receivingItemList[index];
        setDragItemListMiddle(newDragItemMiddleList);
      }}
    />
  );

  const FlatListItemSeparator = () => (
    <View style={styles.itemSeparator} />
  );

  return (
    <DraxProvider>
      <View style={styles.container}>
        <Text style={styles.headerStyle}>Drag drop and swap between lists</Text>

        <View style={styles.receivingContainer}>
          {receivingItemList.map((item, index) => (
            <ReceivingZoneUIComponent key={index} item={item} index={index} />
          ))}
        </View>

        <View style={styles.draxListContainer}>
          <DraxList
            data={dragItemMiddleList}
            renderItemContent={({ item }) => <DragUIComponent item={item} />}
            keyExtractor={(item, index) => index.toString()}
            numColumns={4}
            ItemSeparatorComponent={FlatListItemSeparator}
            scrollEnabled={true}
          />
        </View>
      </View>
    </DraxProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    paddingTop: 40,
    justifyContent: 'space-evenly',
  },
  centeredContent: {
    borderRadius: 10,
  },
  receivingZone: {
    height: (Dimensions.get('window').width / 4) - 12,
    width: (Dimensions.get('window').width / 4) - 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  receiving: {
    borderColor: 'red',
    borderWidth: 2,
  },
  draggableBox: {
    width: (Dimensions.get('window').width / 4) - 12,
    height: (Dimensions.get('window').width / 4) - 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  dragging: {
    opacity: 0.2,
  },
  hoverDragging: {
    borderColor: 'magenta',
    borderWidth: 2,
  },
  receivingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  itemSeparator: {
    height: 15,
  },
  draxListContainer: {
    padding: 5,
    height: 200,
  },
  textStyle: {
    fontSize: 18,
  },
  headerStyle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
  },
});

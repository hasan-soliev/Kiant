import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import FastImage from "react-native-fast-image";

const FastImageLoader = ({ uri, style }) => {
  const [loading, setLoading] = useState(true);

  return (
    <View>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator
            style={StyleSheet.absoluteFill}
            size="large"
            color="#0000ff"
          />
        </View>
      ) : (
        <FastImage
          source={{ uri }}
          style={styles.img}
          onLoad={() => setLoading(false)}
          resizeMode={FastImage.resizeMode.cover}
        />
      )}

      <FastImage
        source={{ uri }}
        style={{ width: 0.2, height: 0.2 }}
        onLoad={() => setLoading(false)}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  loader: {
    width: 150,
    height: 200,
    backgroundColor: "lightgray",
    borderRadius: 10,
  },
  img: {
    width: 150,
    height: 200,
    borderRadius: 10,
  },
});

export default FastImageLoader;

import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Pressable,
  Text,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {Check, Copy} from 'lucide-react-native';

const ClipboardComponentInput = ({id, url, showLogo, onCopy}: any) => {
  const copyToClipboard = () => {
    Clipboard.setString(url);
    onCopy(id);
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={styles.containerInput}
      onPress={copyToClipboard}>
      <Text style={styles.input}>{url}</Text>
      {showLogo ? (
        <Check color={'green'} />
      ) : (
        <TouchableOpacity onPress={copyToClipboard}>
          <Copy color={'#0F172A'} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};
export default ClipboardComponentInput;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  containerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    marginBottom: 10,
    zIndex: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 5,
    marginRight: 10,
    color: '#0F172A',
  },
  icon: {
    width: 20,
    height: 20,
  },
});

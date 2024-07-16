import {
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {Check, ChevronLeft, Copy} from 'lucide-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import ClipboardComponent from '../ui/clipboard-component';
import ClipboardComponentInput from '../ui/clipboard-component';
import Footer from '../ui/footer.component';
const Links = ({navigation, route}: any) => {
  let {
    instructionTitle,
    instructionUrl,
    driverTitle,
    driverUrl,
    softTitle,
    softUrl,
    videoTitle,
    videoUrl,
    id,
  } = route.params.item;
  let url = route.params.url;
  const [copiedId, setCopiedId] = useState('');

  const handleCopy = (id: string) => {
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId('');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.5}
          style={styles.arrow}>
          <ChevronLeft color={'#0F172A'} />
        </TouchableOpacity>
        {url && <Image source={{uri: url}} style={styles.logo} />}

        <View style={{flex: 0.2}} />
      </View>
      <ScrollView>
        <View style={styles.content}>
          <View style={styles.contentItems}>
            <Text style={styles.title}>Инструкция</Text>
            <Text style={styles.about}>{instructionTitle}</Text>
            <ClipboardComponent
              id="instruction"
              url={instructionUrl}
              showLogo={copiedId === 'instruction'}
              onCopy={handleCopy}
            />
          </View>
          <View style={styles.contentItems}>
            <Text style={styles.title}>Драйвера</Text>
            <Text style={styles.about}>{driverTitle}</Text>
            <ClipboardComponent
              id="driver"
              url={driverUrl}
              showLogo={copiedId === 'driver'}
              onCopy={handleCopy}
            />
          </View>
          <View style={styles.contentItems}>
            <Text style={styles.title}>Софт</Text>
            <Text style={styles.about}>{softTitle}</Text>
            <ClipboardComponent
              id="soft"
              url={softUrl}
              showLogo={copiedId === 'soft'}
              onCopy={handleCopy}
            />
          </View>
          <View style={styles.contentItems}>
            <Text style={styles.title}>Видео</Text>
            <Text style={styles.about}>{videoTitle}</Text>
            <ClipboardComponent
              id="video"
              url={videoUrl}
              showLogo={copiedId === 'video'}
              onCopy={handleCopy}
            />
          </View>
        </View>
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Links;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingLeft: 20,
    paddingBottom: 20,
  },
  logo: {
    width: 55,
    height: 55,
  },
  arrow: {
    borderRadius: 90,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  content: {
    marginTop: 30,
    paddingHorizontal: 20,
    gap: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#0F172A',
  },
  about: {
    letterSpacing: 0.3,
    lineHeight: 23.8,
    color: '#0056D2',
  },
  containerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  icon: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 5,
    marginRight: 10,
  },
  contentItems: {
    paddingHorizontal: 10,
    gap: 10,
  },
});

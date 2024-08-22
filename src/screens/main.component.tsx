import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../util/config";
import Tab from "../ui/tab.component";
import FastImageLoader from "../ui/image-loader.component";
import ImageViewer from "react-native-image-zoom-viewer";
import RNFS from "react-native-fs";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { ChevronLeft, Save, Share2Icon, Wallpaper } from "lucide-react-native";
import ManageWallpaper, { TYPE } from "react-native-manage-wallpaper";
import analytics from "@react-native-firebase/analytics";
import {
  AdImpression,
  AdType,
  BannerAd,
  BannerAdRef,
  BannerAdSize,
  CAS,
} from "react-native-cas";
import { CasProvider, useCasContext } from "../contexts/cas.context";
import { Ads } from "./ads";
import { Setup } from "./setup";
const Main = ({ navigation }: any) => {
  const [tabs, setTabs] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [urls, setUrls] = useState([]);
  const [modal, setModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); // Индекс текущего изображения

  const handleTabPress = (tabName: string) => {
    if (activeTab === tabName) {
      return;
    }
    setActiveTab(tabName);
    const images = Object.values(tabs[0].tabs[tabName]).map((url) => ({
      url,
    }));
    setUrls(images);
  };

  const handleImagePress = (index: number) => {
    setModal(true);
    setCurrentIndex(index);
  };

  useEffect(() => {
    async function fetch() {
      const dataCollection = collection(db, "tabs");
      const dataSnapshot = await getDocs(dataCollection);
      const dataList = dataSnapshot.docs.map((doc) => doc.data());
      setTabs(dataList);
      setLoading(true);
    }
    fetch();
  }, []);

  useEffect(() => {
    if (loading && tabs.length > 0) {
      setActiveTab(Object.keys(tabs[0].tabs)[0]);
    }
  }, [tabs, loading]);

  useEffect(() => {
    if (loading && tabs && activeTab) {
      const images = Object.values(tabs[0].tabs[activeTab]).map((url) => ({
        url,
      }));
      setUrls(images);
    }
  }, [activeTab, loading]);
  const context = useCasContext();
  const ref = useRef<BannerAdRef | null>(null);

  const nextAd = useCallback(() => {
    ref.current?.loadNextAd();
  }, []);
  useEffect(() => {
    CAS.debugValidateIntegration();
    CAS.buildManager({
      testMode: true,
    });
    CAS.setSettings({
      testDeviceIDs: ["6618149427"],
    });
  }, []);
  useEffect(() => {
    const backAction = () => {
      if (modal) {
        setModal(false);
        return true; // Возвращаем true, чтобы предотвратить закрытие приложения
      }
      return false; // Возвращаем false, чтобы обычное поведение кнопки "назад" сохранилось
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [modal]);

  const getCurrentImageUrl = () => {
    if (urls.length > 0 && currentIndex >= 0 && currentIndex < urls.length) {
      return urls[currentIndex].url;
    }
    return null;
  };

  const saveImageToGallery = async () => {
    analytics().logEvent("download_Wallpaper", {
      image_url: getCurrentImageUrl(),
      tab: activeTab,
    });
    const imageUrl = getCurrentImageUrl();
    if (!imageUrl) {
      ToastAndroid.show("Failed to get the image URL.", ToastAndroid.SHORT);
      return;
    }

    try {
      // Запрос разрешений на Android

      // Скачивание изображения
      const downloadDest = `${RNFS.DownloadDirectoryPath}/${Math.random()}.jpg`;
      const downloadResult = await RNFS.downloadFile({
        fromUrl: imageUrl,
        toFile: downloadDest,
      }).promise;

      if (downloadResult.statusCode === 200) {
        // Добавление изображения в галерею
        CameraRoll.save(downloadDest, { type: "photo" })
          .then(() =>
            ToastAndroid.show(
              "Изображение сохранено в галерею",
              ToastAndroid.SHORT
            )
          )
          .catch((error) => {
            ToastAndroid.show(
              "Не удалось сохранить изображение",
              ToastAndroid.SHORT
            );

            console.error(error);
          });
      } else {
        ToastAndroid.show(
          "Не удалось сохранить изображение.",
          ToastAndroid.SHORT
        );
      }
    } catch (error) {
      ToastAndroid.show(
        "Произошла ошибка при сохранении изображения.",
        ToastAndroid.SHORT
      );

      console.error(error);
    }
  };

  const setWallpaper = () => {
    showRewarded();
    analytics().logEvent("set_Wallpaper", {
      image_url: getCurrentImageUrl(),
      tab: activeTab,
    });
    const imageUrl = getCurrentImageUrl();
    if (!imageUrl) {
      ToastAndroid.show("Failed to get the image URL.", ToastAndroid.SHORT);

      return;
    }

    ManageWallpaper.setWallpaper(
      {
        uri: imageUrl,
      },
      () => ToastAndroid.show("Обои успешно установлены.", ToastAndroid.SHORT),
      TYPE.HOME
    );
  };
  const delay = async (ms: number) => new Promise((res) => setTimeout(res, ms));

  const initCas = useCallback(async () => {
    await CAS.debugValidateIntegration();

    const { manager, result } = await CAS.buildManager(
      {
        consentFlow: {
          enabled: true,
          requestATT: true,
        },
        testMode: true,
        userId: "user_id",
        adTypes: [
          AdType.Interstitial,
          AdType.Banner,
          AdType.Rewarded,
          AdType.AppOpen,
        ],
        casId: Platform.OS === "ios" ? "6618149427" : undefined,
      },
      (params) => {
        null;
      }
    );

    context.setManager(manager);
  }, []);
  const showInterstitial = useCallback(async () => {
    const { manager } = context;

    if (manager) {
      await manager.loadInterstitial();

      while (true) {
        const isReady = await manager.isInterstitialReady();

        if (isReady) {
          await manager.showInterstitial(
            createCallbacks("Interstitial", context.logCasInfo)
          );
          break;
        } else {
          await delay(1000);
        }
      }
    }
  }, [context]);

  const showRewarded = useCallback(async () => {
    const { manager } = context;

    if (manager) {
      await manager.loadRewardedAd();

      while (true) {
        const isReady = await manager.isRewardedAdReady();

        if (isReady) {
          await manager.showRewardedAd(
            createCallbacks("Rewarded", context.logCasInfo)
          );
          break;
        } else {
          await delay(1000);
        }
      }
    }
  }, [context]);

  const createCallbacks = (
    adType: string,
    logger: (...data: any[]) => void
  ) => ({
    onShown: () => {
      logger(adType + " shown");
    },
    onShowFailed: (message: string) => {
      logger(adType + " shown failed, error: ", message);
    },
    onClicked: () => {
      logger(adType + " shown clicked");
    },
    onComplete: () => {
      logger(adType + " shown completed");
    },
    onClosed: () => {
      logger(adType + " shown closed");
    },
    onImpression: (ad: AdImpression) => {
      logger(adType + " shown, impression: ", JSON.stringify(ad));
    },
  });
  useEffect(() => {
    initCas();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>А4 Обои</Text>
      </View>
      {!loading && (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size={"large"} color={"blue"} />
        </View>
      )}

      {modal && (
        <Modal visible={modal} transparent={true}>
          <ImageViewer
            pageAnimateTime={800}
            imageUrls={urls}
            useNativeDriver={true}
            saveToLocalByLongPress={false}
            enablePreload={true}
            index={currentIndex}
            onSwipeDown={() => setModal(false)}
            enableSwipeDown={true}
            footerContainerStyle={() => null}
            onChange={(index) => setCurrentIndex(index)} // Обновляем индекс при смене изображения
            menuContext={{
              saveToLocal: "Сохранить в галерею",
              cancel: "Отмена",
            }}
            renderHeader={() => (
              <TouchableOpacity
                style={{ position: "absolute", top: 33, left: 33, zIndex: 99 }}
                onPress={() => setModal(false)}
              >
                <ChevronLeft size={35} color={"white"} />
              </TouchableOpacity>
            )}
            loadingRender={() => (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ActivityIndicator size={"large"} />
              </View>
            )}
            style={{ flex: 1 }}
          />
          <View
            style={{
              position: "absolute",
              bottom: 90,
              width: "100%",
              alignItems: "center",
              justifyContent: "space-around",
              flexDirection: "row",
            }}
          >
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                saveImageToGallery();
                setTimeout(() => {
                  showRewarded();
                }, 1000);
              }}
            >
              <Save color={"white"} size={35} />
              <Text style={styles.buttonText}>Скачать</Text>
            </TouchableOpacity>
            {Platform.OS === "android" && (
              <TouchableOpacity style={styles.button} onPress={setWallpaper}>
                <Wallpaper color={"white"} size={35} />
                <Text style={styles.buttonText}>Установить</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={() => Share.share({ message: getCurrentImageUrl() })}
            >
              <Share2Icon color={"white"} size={35} />
              <Text style={styles.buttonText}>Поделиться</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      <View>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          horizontal
          contentContainerStyle={styles.rowTab}
        >
          {tabs &&
            loading &&
            Object.entries(tabs[0].tabs).map(([tabName]) => (
              <View key={tabName}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleTabPress(tabName)}
                >
                  <Tab tab={tabName} isActive={activeTab === tabName} />
                </TouchableOpacity>
              </View>
            ))}
        </ScrollView>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {loading &&
          tabs &&
          Object.entries(tabs[0].tabs).map(
            ([tabName, urls]) =>
              activeTab === tabName &&
              Object.entries(urls).map(([urlKey, urlValue], index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    handleImagePress(index);

                    setTimeout(() => {
                      showInterstitial();
                    }, 1000);
                  }}
                >
                  <FastImageLoader uri={urlValue} style={styles.image} />
                </TouchableOpacity>
              ))
          )}
      </ScrollView>

      {/* <BannerAd size={BannerAdSize.Smart} refreshInterval={20} /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    flex: 1,
  },
  title: {
    color: "white",
    fontSize: 28,
  },
  header: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  rowTab: {
    flexDirection: "row",
    paddingVertical: 15,
    gap: 15,
  },
  contentContainer: {
    paddingHorizontal: 20,
    flexDirection: "row",
    gap: 20,
    flexWrap: "wrap",
  },
  button: {
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(128, 128, 128, 0.5)",
    padding: 5,
    borderRadius: 10,
    width: 100,
  },
  buttonText: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
});

export default Main;

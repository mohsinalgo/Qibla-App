import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, StatusBar,ToastAndroid, PermissionsAndroid, Alert, ImageBackground } from "react-native";
import CompassHeading from "react-native-compass-heading";
import Geolocation from 'react-native-geolocation-service';

const App = () => {
  const [direction, setDirection] = useState(0);
  const [qibla, setQibla] = useState(0);

  useEffect(() => {
    requestLocationPermission();
    const degreeUpdateRate = 3;
    const compassListener = CompassHeading.start(degreeUpdateRate, ({ heading }) => {
      setDirection(heading);
    });

    return () => {
      CompassHeading.stop(compassListener);
    };
  }, []);

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to calculate Qibla direction.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getLocation();
      }
      else if (granted === PermissionsAndroid.RESULTS.DENIED) {
        ToastAndroid.show(
          'Location permission denied by user.',
          ToastAndroid.LONG,
        );
        showAlert();
      } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        ToastAndroid.show(
          'Location permission revoked by user.',
          ToastAndroid.LONG,
        );
        showAlert();
      } else {
        showAlert();
      } 
    } catch (err) {
      console.log("No Access to location" + err);
    }
  };


  const showAlert = () => {
    Alert.alert(
      "Location Permission Required",
      "Please grant permission to access your location.",
      [
        {
          text: "OK",
          onPress: () => requestLocationPermission(),
        },
      ],
      { cancelable: false }
    );
  };

  const getLocation = async () => {

    Geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        getDirection(latitude, longitude);
      },
      (error) => {
        if (error.code === 1) {
          requestLocationPermission();
        }
      },
      { enableHighAccuracy: false, timeout: 10000, },
    );
  };

  const getDirection = (latitude, longitude) => {
    const kaabaLatitude = 21.4225;
    const kaabaLongitude = 39.8262;
    const userLatRad = deg2rad(latitude);
    const kaabaLatRad = deg2rad(kaabaLatitude);
    const deltaLon = deg2rad(kaabaLongitude - longitude);

    const y = Math.sin(deltaLon);
    const x = Math.cos(userLatRad) * Math.tan(kaabaLatRad) -
      Math.sin(userLatRad) * Math.cos(deltaLon);

    const qiblaDirection = rad2deg(Math.atan2(y, x));
    setQibla(qiblaDirection);
  };

  const deg2rad = (degrees) => {
    return degrees * (Math.PI / 180);
  };

  const rad2deg = (radians) => {
    return radians * (180 / Math.PI);
  };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#170366" translucent={true} />
      <View style={styles.header}>
        <View style={styles.leftIcon}>
          <Image source={require('./assets/lefticon.png')} style={styles.icon} />
        </View>
        <Text style={styles.headerText}>Qibla Direction</Text>
        <View style={styles.rightIcon}></View>
      </View>


      <View style={styles.compassContainer}>
        <View style={styles.directionContainer}>
          <Text style={styles.directionText}>Qibla: </Text>
          <Text style={[styles.directionText, { top: 5 }]}>{direction}°</Text>
        </View>
        <ImageBackground
          source={require('./assets/qibla-direction6.png')}
          style={[styles.compassImage, {
            transform: [
              {
                rotate: `${360 - direction}deg`,
              },
            ],
          },]}
        >
          <View style={[styles.compassNeedleImage, { transform: [{ rotate: `${qibla}deg` }] }]}>
            <Image source={require('./assets/kaaba.png')} style={styles.kaaba} />
          </View>
        </ImageBackground>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Please keep your cellphone horizontal for more accurate direction</Text>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#170366",
    top: 10,
    alignItems: "center",
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  leftIcon: {
    marginLeft: 20
  },
  rightIcon: {
    height: 20,
    width: 20
  },
  icon: {
    width: 25,
    height: 20
  },
  headerText: {
    alignSelf: 'center',
    color: "#e3ad27",
    fontSize: 22
  },
  directionContainer: {
    flex: 0.2,
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "center",
  },
  kaabaImage: {
    width: 80,
    height: 80,
  },
  compassContainer: {
    position: 'relative',
    justifyContent: "space-around",
    height: "60%",
    alignItems: "center"
  },
  compassImage: {
    width: 300,
    height: 300,
  },
  compassNeedle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  directionText: {
    textAlign: 'center',
    color: "#e3ad27",
    fontSize: 22
  },
  infoContainer: {
    flex: 0.2,
    justifyContent: "center",
    alignItems: 'center',
    marginHorizontal: 30
  },
  infoText: {
    textAlign: 'center',
    color: "#919191",
    fontSize: 16
  },
  compassNeedleImage: {
    width: 120,
    height: 200,
  },
  kaaba: {
    width: 30,
    height: 30,
    bottom: 50,
    resizeMode: 'contain',
    flex: 0.7
  },
});

export default App;
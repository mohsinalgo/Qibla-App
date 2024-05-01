import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, StatusBar,PermissionsAndroid, Alert, ImageBackground } from "react-native";
import CompassHeading from "react-native-compass-heading";
import Geolocation from '@react-native-community/geolocation';

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
          'title': 'Your App',
          'message': 'Allow app to access your location '
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getLocation();
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

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        getDirection(latitude, longitude);
      },
      () => Alert.alert('Please ensure that your current location is enabled to display the Qibla direction.'),
      { enableHighAccuracy: true }
    );
  };

  const getDirection = (latitude, longitude) => {
    const PI = Math.PI;
    const latk = (21.4225 * PI) / 180.0;
    const longk = (39.8264 * PI) / 180.0;
    const phi = (latitude * PI) / 180.0;
    const lambda = (longitude * PI) / 180.0;
    const qiblad =
      (180.0 / PI) *
      Math.atan2(
        Math.sin(longk - lambda),
        Math.cos(phi) * Math.tan(latk) -
        Math.sin(phi) * Math.cos(longk - lambda),
      );
    setQibla(qiblad);
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
      <View style={styles.directionContainer}>
        <Text style={styles.directionText}>Qibla: </Text>
        <Text style={[styles.directionText, { top: 5 }]}>{direction}°</Text>
      </View>
      <ImageBackground source={require('./assets/qibla-direction6.png')} style={[styles.image, { transform: [{ rotate: `${360 - direction}deg` }] }]}>
        <View style={[styles.compassContainer, { transform: [{ rotate: `${qibla}deg` }] }]}>
          <Image source={require('./assets/kaaba.png')} style={styles.kaaba} />
        </View>
      </ImageBackground>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Please keep your cellphone horizontal for more accurate direction</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    borderColor: 'red',
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
    justifyContent: "center"
  },
  directionText: {
    textAlign: 'center',
    color: "#e3ad27",
    fontSize: 22
  },
  image: {
    width: '90%',
    flex: 0.4,
    resizeMode: 'cover',
    alignSelf: 'center'
  },
  compassContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  kaaba: {
    marginBottom: '60%',
    width: 40,
    height: 40,
    bottom: 90,
    resizeMode: 'contain',
    flex: 0.7
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
  }
});

export default App;

import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {getMeasurements, getPrediction} from '../api/api_calls';

// Mock function to simulate fetching other measurements
const fetchMeasurements = () => {
  const data = getMeasurements();
  return Promise.resolve(data);
};

// Mock function to simulate fetching mood data
const fetchMood = () => {
  const mood = getPrediction();
  return Promise.resolve(mood);
};

export default function HomeScreen({navigation}) {
  const [data, setData] = useState({
    acc_x: [],
    acc_y: [],
    acc_z: [],
    bvp: [],
    eda: [],
    temp: [],
  });
  const [mood, setMood] = useState(null);

  useEffect(() => {
    // Fetch the data when the component mounts

    const updateMetrics = () => {
      fetchMeasurements().then((loadedData) => {
        setData(loadedData);
      });


      fetchMood().then((moodData) => {
        setMood(moodData);
      });
    }
    updateMetrics();

    const intervalId = setInterval(updateMetrics, 10000);

    return () => {
      clearInterval(intervalId);
    }
  }, []);
  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        height: 80,
      },
      headerTitle: () => (
          <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>
            Mental Health Monitoring
          </Text>
      ),
      headerRight: () => (
          <View style={{marginRight: 20}}>
            <TouchableOpacity onPress={() => navigation.navigate('Account')} style={{marginLeft: 15}}>
              <Ionicons name="person-circle" size={30} color="white"/>
            </TouchableOpacity>
          </View>
      ),
    });
  }, []);

  return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons
                  name={getMoodIcon(mood)}
                  size={40}
                  color="#3fa4e8"
                  style={styles.icon}
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Mood</Text>
              <Text style={styles.cardValueLarge}>{getMoodName(mood)}</Text>
            </View>
          </View>
          {['acc_magnitude', 'bvp', 'eda', 'temp'].map((key, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.iconContainer}>
                  <Ionicons
                      name={getIconName(key)}
                      size={40}
                      color="#3fa4e8"
                      style={styles.icon}
                  />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{formatLabel(key)}</Text>
                  <Text style={styles.cardValueLarge}>
                    {Array.isArray(data[key]) ? data[key].join(', ') : data[key]}
                  </Text>
                </View>
              </View>
          ))}

        </ScrollView>
      </View>
  );
}

// Helper function to get the icon name based on the type of data
const getIconName = (key) => {
  switch (key) {
    case 'acc_magnitude':
      return 'walk';
    case 'bvp':
      return 'heart'; // Icon for BVP (heart rate)
    case 'eda':
      return 'water'; // Icon for EDA
    case 'temp':
      return 'thermometer'; // Icon for temperature
    default:
      return 'alert-circle'; // Default icon
  }
};

const getMoodName = (key) => {
  switch (key) {
    case 'stress':
      return 'Stressed';
    case 'baseline':
      return 'Normal'
    case 'amusement':
      return 'Happy';
    case 'meditation':
      return 'Calm'
  }
}

const getMoodIcon = (key) => {
  if(key === 'stress'){
    return 'sad';
  }
  return 'happy';
}

// Helper function to format the label
const formatLabel = (key) => {
  switch (key) {
    case 'acc_magnitude':
      return 'Acceleration Magnitude';
    case 'bvp':
      return 'BVP (Heart Rate)';
    case 'eda':
      return 'EDA (Sweat Response)';
    case 'temp':
      return 'Temperature';
    default:
      return key;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    elevation: 3, // Adds shadow for Android
    shadowColor: '#000', // Adds shadow for iOS
    shadowOpacity: 0.1,
    shadowRadius: 5,
    justifyContent: 'center', // Centers content horizontally
    alignItems: 'center', // Centers content vertically
  },
  iconContainer: {
    backgroundColor: '#3fa4e8',
    borderRadius: 50,
    width: 60, // Increased size of the icon container
    height: 60, // Increased size of the icon container
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10, // Space between icon and text
  },
  icon: {
    color: 'white',
  },
  cardContent: {
    alignItems: 'center', // Center text in the card horizontally
    justifyContent: 'center', // Center text in the card vertically
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center', // Ensure the title is centered
  },
  cardValueLarge: {
    fontSize: 24, // Larger text for the main value
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5, // Space between main value and other text
    textAlign: 'center', // Ensure the main value is centered
  },
  cardValue: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center', // Ensure the value is centered
  },
});

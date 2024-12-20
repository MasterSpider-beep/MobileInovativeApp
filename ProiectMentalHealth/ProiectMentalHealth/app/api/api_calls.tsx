import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "http://localhost:5000";

export const login = async (username: string, password: string) => {
    try {
        const response = await axios.post(API_URL + `/login`, {
        username,
        password,
        });
        await AsyncStorage.setItem("token", response.data.token);
        return "OK";
    } catch (error) {
        console.log(error);
        return "Couldn't login";
    }
}

export const getMeasurements = async ()=>{
    try{
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get(API_URL + '/measurements',{headers:{"Authorization" : "Bearer " + token}})
        console.log(response);
        return response.data
    }catch(error){
        return error.response;
    }
}

export const getPrediction = async ()=>{
    try{
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get(API_URL + '/predict',{headers:{"Authorization" : "Bearer " + token}})
        console.log(response);
        return response.data.prediction
    }catch(error){
        return error.response.data;
    }
}
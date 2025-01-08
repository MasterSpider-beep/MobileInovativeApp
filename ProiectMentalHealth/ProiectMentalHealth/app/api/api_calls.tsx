import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "http://192.168.1.135:5000";

export const login = async (username: string, password: string) => {
    try {
        const response = await axios.post(API_URL + `/login`, {
        username,
        password,
        });
        await AsyncStorage.setItem("token", response.data.token);
        return "OK";
    } catch (error) {
        const errorA = error as Error;
        console.log(error);
        return errorA.message;
    }
}

export const getMeasurements = async ()=>{
    try{
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get(API_URL + '/measurements',{headers:{"Authorization" : "Bearer " + token}})
        return response.data
    }catch(error){
        console.log(error);
    }
}

export const getPrediction = async ()=>{
    try{
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get(API_URL + '/predict',{headers:{"Authorization" : "Bearer " + token}})
        return response.data.prediction
    }catch(error){
        console.log(error);
    }
}

export const getAdviceAPI = async () => {
    try{
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get(API_URL + "/adviceAPI", {headers:{"Authorization" : "Bearer " + token}});
        return response.data;
    }catch (error){
        console.log(error);
    }
}
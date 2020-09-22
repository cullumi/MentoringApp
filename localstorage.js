// AsyncStorage interaction via https://stackoverflow.com/questions/33790143/how-to-store-data-locally-in-react-native-that-is-not-a-string
const Storage = {

    getItem: async function (key) {
        let item = await AsyncStorage.getItem(key);
        return JSON.parse(item);
    },

    setItem: async function (key, value) {
        return await AsyncStorage.setItem(key, JSON.stringify(value));
    },

    removeItem: async function (key) {
        return await AsyncStorage.removeItem(key);
    }

};
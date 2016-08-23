import axios from 'axios';
import Promise from 'bluebird';

const load = (conf) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(conf.response);
        }, 1000);
    });
};

const TEMP_RANGE = [18, 24];

const randomTemp = () => {
    return parseFloat((TEMP_RANGE[0] + (Math.random() * (TEMP_RANGE[1] - TEMP_RANGE[0]))).toFixed(1));
};

const generateTemperature = () => {
    return ([...Array(10).keys()]).map((i, j) => {
        return {
            room: j + 1,
            temperature: randomTemp()
        };
    });
};

export default {
    load() {
        return load({
            response: generateTemperature()
        });
    },
    subscribe(callback) {
        setInterval(() => {
            callback(Math.ceil(10 * Math.random()), randomTemp());
        }, 2000);
    }
};

import { EventEmitter } from 'events';
import api from '../api';

class SystemStore extends EventEmitter {
    constructor(...args) {
        super(...args);
        this._data = [];
    }
    authenticate() {
        return api.authenticate().then((res) => {
            console.info(`successfully authenticated`);
        }, (res) => {
            console.error(`failed to authenticate`);
            this._authError = true;
        });
    }
    load() {
        return api.load().then((res) => {
            this._data = res;
            res.forEach((r) => {
                this.subscribe(r);
            })
            return res;
        });
    }
    subscribe(system) {
        Object.keys(system.sensors).forEach((k) => {
            const sensor = system.sensors[k];
            console.debug(`subscribing to sensor: `, sensor);
            api.subscribe(sensor.topic, ({ value }) => {
                this._data.forEach((s, index) => {
                    if (s.uri === system.uri) {
                        if (sensor.value) {
                            sensor.prevValue = sensor.value
                        }
                        sensor.value = value;
                        sensor.timestamp = new Date();
                        this.emit("update");
                    }
                });
            });
        });
    }
    addValue(sensor, value) {
        if (sensor.value) {
            sensor.prevValue = sensor.value;
        }
        sensor.value = value;
    }
    getData() {
        return this._data;
    }
}

export default new SystemStore();

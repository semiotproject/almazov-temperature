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
                this.subscribe(r.uri, r.topic);
            });
            return res;
        });
    }
    subscribe(uri, topic) {
        api.subscribe(topic, ({ temperature }) => {
            this._data.forEach((d, index) => {
                if (d.uri === uri) {
                    if (this._data[index].temperature) {
                        this._data[index].prevTemperature = this._data.index.temperature;
                    }
                    this._data[index].temperature = temperature;
                    this.emit("update");
                }
            });
        });
    }
    getData() {
        return this._data;
    }
}

export default new SystemStore();

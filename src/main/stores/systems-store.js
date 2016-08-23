import { EventEmitter } from 'events';
import api from '../api';

class SystemStore extends EventEmitter {
    constructor(...args) {
        super(...args);
    }
    load() {
        return api.load().then((res) => {
            this._data = res;
            this.subscribe();
            return res;
        });
    }
    subscribe() {
        api.subscribe((room, temperature) => {
            this._data.forEach((d, index) => {
                if (d.room === room) {
                    console.info(`updating room ${room} to ${temperature}`);
                    this._data[index].temperature = temperature;
                    this.emit('update');
                }
            });
        });
    }
    getData() {
        return this._data;
    }
}

export default new SystemStore();

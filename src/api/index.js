import axios from 'axios';
import Promise from 'bluebird';
import CONFIG from '../config';
import parser from '../parsers/';
import _ from 'lodash';

const DEBUG = false;

let wampConnection = null;

const load = (conf) => {
    if (DEBUG) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(conf.response);
            }, 1000);
        });
    }
    return axios(conf.url, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};
const post = (url, data) => {
    if (DEBUG) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(conf.response);
            }, 1000);
        });
    }
    return axios.post(url, data, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

const TEMP_RANGE = [18, 24];

const randomTemp = () => {
    return parseFloat((TEMP_RANGE[0] + (Math.random() * (TEMP_RANGE[1] - TEMP_RANGE[0]))).toFixed(1));
};

const generateObservations = () => {
    return ([...Array(10).keys()]).map((i, j) => {
        return {
            room: j + 1,
            temperature: randomTemp()
        };
    });
};
const generateSystems = () => {
    return ([...Array(10).keys()]).map((i, j) => {
        return {
            id: j + 1,
            room: j + 1
        };
    });
};

export default {
    authenticate() {
        const { user, password } = CONFIG.platformCredentials;
        console.info(`authenticating; user is ${user}, password is ${password}`);
        return post(CONFIG.authenticationURL, {
            username: user,
            password
        }).then((res) => {
            console.info(`authentication succeeded; cookie is ${res}`);
        }, (e) => {
            console.error(`authentication failed; error: `, e);
            throw e;
        });
    },
    load() {
        return new Promise((resolve, reject) => {
            load({
                url: CONFIG.systemsURL,
                response: generateSystems()
            }).then((res) => {
                console.info(`raw systems: `, res.data);
                return parser.parseSystems(res.data);
            }).then((systems) => {
                console.info(`parsed systems: `, systems, `; loading observations..`);
                load({
                    url: CONFIG.observationsURL,
                    response: generateObservations()
                }).then((res) => {
                    console.info(`raw observations: `, res);
                    return parser.parseObservations(res);
                }).then((obs) => {
                    console.info(`parsed observations: `, obs, '; all data is loaded');
                    const combinedData = systems.map((s) => {
                        return _.assign(s, {
                            temperature: (_.find(obs, (o) => {
                                return o.room === s.room;
                            })).temperature
                        })
                    });
                    resolve(combinedData);
                })
            });
        });
    },
    subscribe(callback) {
        setInterval(() => {
            callback(Math.ceil(10 * Math.random()), randomTemp());
        }, 2000);
        /*

        wampConnection = new autobahn.Connection({
             url: `wss://${CONFIG.platformHost}/wamp`,
             realm: 'realm1'
        });
        wampConnection.onopen = function (session) {
           session.subscribe(`${CONFIG.observationsTopic}`, () => {

           });
        };
        wampConnection.open();

        */
    },
};

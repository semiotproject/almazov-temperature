import axios from 'axios';
import Promise from 'bluebird';
import CONFIG from '../config';
import parser from '../parsers/';
import _ from 'lodash';

const DEBUG = false;

const { user, password } = CONFIG.platformCredentials;
let wampConnection = null;
let wampSession = null;
const onWampConnectionOpenCallbacks = [];

wampConnection = new autobahn.Connection({
    url: `wss://${CONFIG.platformHost}/wamp`,
    realm: 'realm1',
    authmethods: ["ticket"],
    authid: user,
    onchallenge: (session, method, extra) => {
        if (method === "ticket") {
            console.info(`authorising on WAMP wit ticket method`);
            return password;
        }
        console.error(`unknown WAMP authentication method '${method}'`);
    }
});
wampConnection.onopen = function(session) {
    wampSession = session;
    onWampConnectionOpenCallbacks.map((c) => {
        c(session);
    })
};
wampConnection.open();

function extractObservationFromWAMPMessage(msg) {
    return {
        temperature: parseFloat(msg['ssn:observationResult']['ssn:hasValue']['qudt:quantityValue'])
    };
}

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
            'Accept': 'application/json'
        }
    }).then((res) => {
        return res.data;
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
                return parser.parseSystems(res);
            }).then((systems) => {
                console.info(`parsed systems: `, systems, `; loading detail information..`);
                Promise.all(
                    systems.map(this.loadDetail.bind(this))
                ).then((res) => {
                    console.info(`all data loaded; awesome!`, res);
                    resolve(res);
                })
            });
        });
    },
    loadDetail(s) {
        return new Promise((resolve, reject) => {
            load({
                url: s.uri
            }).then((system) => {
                console.info(`loaded detail info about ${s.uri}; loading temperature sensor..`);
                const parsedSystem = parser.parseSystem(system);
                load({
                    url: parsedSystem.temperatureSensorUri
                }).then((sensor) => {
                    return parser.parseSensor(sensor);
                }).then((parsedSensor) => {
                    load({
                        url: parsedSensor["apidoc:observations"]
                    }).then((observation) => {
                        return parser.parseObservation(observation);
                    }).then((parsedObservation) => {
                        resolve({
                            uri: s.uri,
                            room: parsedSystem.room,
                            topic: parsedObservation.topic,
                            temperature: parsedObservation.temperature
                        });
                    });
                })
            })
        });
    },
    subscribe(topic, callback) {
        this.ensureWampSession((session) => {
            session.subscribe(topic, (msg) => {
                console.info(`message received`, msg);
                callback(extractObservationFromWAMPMessage(JSON.parse(msg[0])));
            });
        });
    },
    ensureWampSession(callback) {
        if (wampSession) {
            callback(wampSession);
        } else {
            onWampConnectionOpenCallbacks.push(callback);
        }
    }
};

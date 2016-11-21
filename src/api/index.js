import axios from 'axios';
import Promise from 'bluebird';
import CONFIG from '../config';
import parser from '../parsers/';
import _ from 'lodash';
import moment from 'moment';

const DEBUG = false;

const { user, password } = CONFIG.platformCredentials;
let wampConnection = null;
let wampSession = null;
const onWampConnectionOpenCallbacks = [];

let IDENTIFICATION_TOKEN = null;

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
        value: parseFloat(msg['ssn:observationResult']['ssn:hasValue']['qudt:quantityValue'])
    };
}

const load = (conf) => {
    const headers = {
        'Accept': 'application/json'
    };
    if (IDENTIFICATION_TOKEN) {
        // TODO:
        // uncomment this, when IDENTIFICATION_TOKEN (or other selected HTTP header) would be in `Access-Control-Allow-Headers` list
        // headers["IDENTIFICATION_TOKEN"] = IDENTIFICATION_TOKEN;
    }
    return axios(conf.url, { headers, withCredentials: true }).then((res) => {
        return res.data;
    });
};
const post = (url, data) => {
    return axios.post(url, data, {
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: true
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
            console.info(`authentication succeeded; identification token is`, res);
            IDENTIFICATION_TOKEN = res;
        }, (e) => {
            console.error(`authentication failed; error: `, e);
            throw e;
        });
    },
    load() {
        return new Promise((resolve, reject) => {
            load({
                url: CONFIG.systemsURL
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
                const parsedSystem = parser.parseSystem(system);
                console.info(`loaded detail info about ${s.uri}: `, parsedSystem);
                Promise.all([
                    this.loadSensor("humidity", parsedSystem.humiditySensorUri),
                    this.loadSensor("temperature", parsedSystem.temperatureSensorUri)
                ]).then((res) => {
                    console.info(`all sensors loaded for system ${s.uri}: `, res);
                    parsedSystem.sensors = {};
                    res.map((r) => {
                        parsedSystem.sensors[r.key] = {
                            timestamp: r.timestamp,
                            topic: r.topic,
                            value: r.value,
                            prevValue: r.prevValue
                        };
                    });
                    resolve(parsedSystem);
                });
            })
        });
    },
    loadSensor(key, url) {
        return new Promise((resolve, reject) => {
            load({
                url
            }).then((sensor) => {
                return parser.parseSensor(sensor);
            }).then((parsedSensor) => {
                load({
                    url: `${parsedSensor["apidoc:observations"]}&start=${encodeURIComponent(moment(CONFIG.observationsStartDate()).format('YYYY-MM-DDTHH:mm:ssZ'))}`
                }).then((observation) => {
                    return parser.parseObservation(observation);
                }).then((parsedObservation) => {
                    if (parsedObservation.value) {
                        resolve({
                            key,
                            topic: parsedObservation.topic,
                            timestamp: parsedObservation.timestamp,
                            value: parsedObservation.value,
                            prevValue: parsedObservation.prevValue
                        });
                    } else {
                        console.warn(`not found observations from ${CONFIG.observationsStartDate()}; loading last observation..`);
                        load({
                            url: `${parsedSensor["apidoc:observations"]}`
                        }).then((observation) => {
                            return parser.parseObservation(observation);
                        }).then((parsedObservation) => {
                            resolve({
                                key,
                                topic: parsedObservation.topic,
                                timestamp: parsedObservation.timestamp,
                                value: parsedObservation.value
                            });
                        });
                    }
                });
            });
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
